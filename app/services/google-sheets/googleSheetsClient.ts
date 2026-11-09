import {
  SPREADSHEET_ID,
  GOOGLE_SHEETS_API_BASE,
  WORKSHEET_HEADERS,
  type WorksheetName,
} from './googleSheetsConfig';
import type { SheetRow, ValueRange, QueryOptions } from './googleSheetsTypes';
import {
  rowToObject,
  objectToRow,
  columnToLetter,
  generateUUID,
  withRetry,
} from './googleSheetsHelpers';
import { googleSheetsAuth } from './googleSheetsAuth';

interface SheetMetadata {
  sheetId: number;
  title: string;
}

export class GoogleSheetsClient {
  private spreadsheetId: string = SPREADSHEET_ID;
  private metadataCache: SheetMetadata[] | null = null;
  private headersCache: Map<string, string[]> = new Map();
  private rowsCache: Map<string, { timestamp: number; data: SheetRow[] }> = new Map();
  private cacheTTLMs = 10000; // 10-second client-side cache

  constructor(spreadsheetId?: string) {
    if (spreadsheetId) {
      this.spreadsheetId = spreadsheetId;
    }
  }

  /**
   * Set or override current spreadsheet ID.
   */
  public setSpreadsheetId(id: string) {
    this.spreadsheetId = id;
    this.metadataCache = null;
    this.headersCache.clear();
    this.rowsCache.clear();
  }

  /**
   * Invalidate local memory cache for a given sheet or all sheets.
   */
  public invalidateCache(sheetName?: string) {
    if (sheetName) {
      this.rowsCache.delete(sheetName);
    } else {
      this.rowsCache.clear();
      this.headersCache.clear();
      this.metadataCache = null;
    }
  }

  /**
   * Get valid Authorization header for Google Sheets API requests.
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await googleSheetsAuth.requestAccessToken(false);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch spreadsheet metadata to get list of sheet tabs and their internal sheetId.
   */
  public async getSpreadsheetMetadata(forceRefresh = false): Promise<SheetMetadata[]> {
    if (this.metadataCache && !forceRefresh) {
      return this.metadataCache;
    }

    const headers = await this.getAuthHeaders();
    const url = `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}?fields=sheets.properties(sheetId,title)`;

    const res = await withRetry(async () => {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`[GoogleSheets] Failed to fetch metadata (${response.status}): ${errorBody}`);
      }
      return response.json();
    });

    const sheets = res.sheets?.map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
    })) || [];

    this.metadataCache = sheets;
    return sheets;
  }

  /**
   * Ensure that a specific worksheet exists with its required headers.
   */
  public async ensureWorksheet(sheetName: WorksheetName): Promise<SheetMetadata> {
    const sheets = await this.getSpreadsheetMetadata();
    const existing = sheets.find((s) => s.title === sheetName);
    if (existing) {
      return existing;
    }

    const headers = await this.getAuthHeaders();
    // 1. Add sheet tab
    const addSheetBody = {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    };

    const addRes = await withRetry(async () => {
      const response = await fetch(`${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(addSheetBody),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to add worksheet "${sheetName}": ${err}`);
      }
      return response.json();
    });

    const newSheetProps = addRes.replies?.[0]?.addSheet?.properties;
    const newSheet: SheetMetadata = {
      sheetId: newSheetProps?.sheetId ?? 0,
      title: sheetName,
    };

    if (this.metadataCache) {
      this.metadataCache.push(newSheet);
    }

    // 2. Add header row
    const expectedHeaders = WORKSHEET_HEADERS[sheetName];
    if (expectedHeaders?.length) {
      await this.setHeaders(sheetName, expectedHeaders);
    }

    return newSheet;
  }

  /**
   * Set or update headers row for a sheet.
   */
  public async setHeaders(sheetName: string, headersList: string[]): Promise<void> {
    const authHeaders = await this.getAuthHeaders();
    const lastCol = columnToLetter(headersList.length - 1);
    const range = `'${sheetName}'!A1:${lastCol}1`;

    await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            range,
            majorDimension: 'ROWS',
            values: [headersList],
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to set headers for "${sheetName}": ${err}`);
      }
      return response.json();
    });

    this.headersCache.set(sheetName, headersList);
  }

  /**
   * Get headers for a worksheet, reading from cache or fetching row 1.
   */
  public async getHeaders(sheetName: WorksheetName): Promise<string[]> {
    if (this.headersCache.has(sheetName)) {
      return this.headersCache.get(sheetName)!;
    }

    const authHeaders = await this.getAuthHeaders();
    const range = `'${sheetName}'!1:1`;

    const res = await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
        { headers: authHeaders }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to get headers for "${sheetName}": ${err}`);
      }
      return response.json();
    });

    const headersList: string[] = res.values?.[0] || WORKSHEET_HEADERS[sheetName] || [];
    this.headersCache.set(sheetName, headersList);
    return headersList;
  }

  /**
   * Fetch all rows from a worksheet as strongly-typed objects.
   */
  public async getRows<T extends SheetRow>(sheetName: WorksheetName, options?: QueryOptions): Promise<T[]> {
    // Check in-memory cache
    const cached = this.rowsCache.get(sheetName);
    const now = Date.now();
    if (cached && (now - cached.timestamp < this.cacheTTLMs)) {
      return this.applyQueryOptions(cached.data as T[], options);
    }

    await this.ensureWorksheet(sheetName);
    const headers = await this.getHeaders(sheetName);
    const authHeaders = await this.getAuthHeaders();
    const range = `'${sheetName}'!A2:${columnToLetter(headers.length - 1)}`;

    const res = await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`,
        { headers: authHeaders }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to fetch rows from "${sheetName}": ${err}`);
      }
      return response.json();
    });

    const rawRows: any[][] = res.values || [];
    const typedRows: T[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || !row[0]) continue; // Skip empty rows or rows without ID
      const item = rowToObject<T>(headers, row);
      typedRows.push(item);
    }

    this.rowsCache.set(sheetName, { timestamp: now, data: typedRows });
    return this.applyQueryOptions(typedRows, options);
  }

  /**
   * Fetch a single row by its UUID id.
   */
  public async getRowById<T extends SheetRow>(sheetName: WorksheetName, id: string): Promise<T | null> {
    const rows = await this.getRows<T>(sheetName);
    return rows.find((r) => r.id === id) || null;
  }

  /**
   * Find rows matching a filter predicate.
   */
  public async findRows<T extends SheetRow>(
    sheetName: WorksheetName,
    predicate: (row: T) => boolean,
    options?: QueryOptions
  ): Promise<T[]> {
    const rows = await this.getRows<T>(sheetName, options);
    return rows.filter(predicate);
  }

  /**
   * Create a single new row in the worksheet.
   */
  public async createRow<T extends SheetRow>(sheetName: WorksheetName, data: Partial<T>): Promise<T> {
    await this.ensureWorksheet(sheetName);
    const headers = await this.getHeaders(sheetName);
    const authHeaders = await this.getAuthHeaders();

    const now = new Date().toISOString();
    const newRecord: Record<string, any> = {
      id: data.id || generateUUID(),
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      ...data,
    };

    const rowValues = objectToRow(headers, newRecord);
    const range = `'${sheetName}'!A:${columnToLetter(headers.length - 1)}`;

    await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            range,
            majorDimension: 'ROWS',
            values: [rowValues],
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to create row in "${sheetName}": ${err}`);
      }
      return response.json();
    });

    this.invalidateCache(sheetName);
    return newRecord as T;
  }

  /**
   * Update a row identified by its UUID id.
   */
  public async updateRow<T extends SheetRow>(
    sheetName: WorksheetName,
    id: string,
    partialData: Partial<T>
  ): Promise<T> {
    await this.ensureWorksheet(sheetName);
    const headers = await this.getHeaders(sheetName);
    const authHeaders = await this.getAuthHeaders();

    // 1. Locate existing row index by fetching column A (IDs)
    const idRange = `'${sheetName}'!A2:A`;
    const idRes = await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(idRange)}`,
        { headers: authHeaders }
      );
      if (!response.ok) {
        throw new Error(`[GoogleSheets] Failed to search row ID in "${sheetName}"`);
      }
      return response.json();
    });

    const ids: any[][] = idRes.values || [];
    const rowIndex = ids.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      throw new Error(`[GoogleSheets] Row with ID "${id}" not found in sheet "${sheetName}".`);
    }

    const actualRowNumber = rowIndex + 2; // +2 accounts for 1-based index and header row

    // 2. Fetch existing row to merge data
    const existing = await this.getRowById<T>(sheetName, id);
    if (!existing) {
      throw new Error(`[GoogleSheets] Row "${id}" data unavailable.`);
    }

    const updatedRecord: Record<string, any> = {
      ...existing,
      ...partialData,
      id,
      updated_at: new Date().toISOString(),
    };

    const rowValues = objectToRow(headers, updatedRecord);
    const targetRange = `'${sheetName}'!A${actualRowNumber}:${columnToLetter(headers.length - 1)}${actualRowNumber}`;

    await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(targetRange)}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            range: targetRange,
            majorDimension: 'ROWS',
            values: [rowValues],
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to update row "${id}" in "${sheetName}": ${err}`);
      }
      return response.json();
    });

    this.invalidateCache(sheetName);
    return updatedRecord as T;
  }

  /**
   * Delete a row by its UUID id (clears the row values or deletes the row dimension).
   */
  public async deleteRow(sheetName: WorksheetName, id: string): Promise<boolean> {
    const metadata = await this.ensureWorksheet(sheetName);
    const authHeaders = await this.getAuthHeaders();

    // 1. Locate row index
    const idRange = `'${sheetName}'!A2:A`;
    const idRes = await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(idRange)}`,
        { headers: authHeaders }
      );
      if (!response.ok) {
        throw new Error(`[GoogleSheets] Failed to search row ID in "${sheetName}"`);
      }
      return response.json();
    });

    const ids: any[][] = idRes.values || [];
    const rowIndex = ids.findIndex((r) => r[0] === id);
    if (rowIndex === -1) {
      return false; // Row doesn't exist
    }

    const startRowIndex = rowIndex + 1; // 0-based index for batchUpdate where 0 is header row

    // 2. Delete row dimension
    const deleteRequestBody = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: metadata.sheetId,
              dimension: 'ROWS',
              startIndex: startRowIndex,
              endIndex: startRowIndex + 1,
            },
          },
        },
      ],
    };

    await withRetry(async () => {
      const response = await fetch(`${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(deleteRequestBody),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to delete row "${id}" in "${sheetName}": ${err}`);
      }
      return response.json();
    });

    this.invalidateCache(sheetName);
    return true;
  }

  /**
   * Batch append multiple rows to a worksheet in a single request.
   */
  public async batchCreate<T extends SheetRow>(sheetName: WorksheetName, items: Partial<T>[]): Promise<T[]> {
    if (!items.length) return [];
    await this.ensureWorksheet(sheetName);
    const headers = await this.getHeaders(sheetName);
    const authHeaders = await this.getAuthHeaders();

    const now = new Date().toISOString();
    const preparedRecords = items.map((data) => ({
      id: data.id || generateUUID(),
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      ...data,
    }));

    const rowsValues = preparedRecords.map((rec) => objectToRow(headers, rec));
    const range = `'${sheetName}'!A:${columnToLetter(headers.length - 1)}`;

    await withRetry(async () => {
      const response = await fetch(
        `${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            range,
            majorDimension: 'ROWS',
            values: rowsValues,
          }),
        }
      );
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] Failed to batch create rows in "${sheetName}": ${err}`);
      }
      return response.json();
    });

    this.invalidateCache(sheetName);
    return preparedRecords as T[];
  }

  /**
   * Execute raw Google Sheets batchUpdate requests (for formatting, tab manipulation, or multi-sheet updates).
   */
  public async batchUpdate(requests: any[]): Promise<any> {
    const authHeaders = await this.getAuthHeaders();
    return await withRetry(async () => {
      const response = await fetch(`${GOOGLE_SHEETS_API_BASE}/${this.spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ requests }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`[GoogleSheets] batchUpdate failed: ${err}`);
      }
      return response.json();
    });
  }

  /**
   * Initialize all 13 worksheets on the target Google Spreadsheet.
   */
  public async initializeAllWorksheets(): Promise<void> {
    const sheetsList = Object.values(WORKSHEET_HEADERS) as string[][];
    const sheetNames = Object.keys(WORKSHEET_HEADERS) as WorksheetName[];

    for (let i = 0; i < sheetNames.length; i++) {
      const name = sheetNames[i];
      await this.ensureWorksheet(name);
    }
  }

  /**
   * Apply pagination, sorting, and limit query options locally.
   */
  private applyQueryOptions<T extends SheetRow>(rows: T[], options?: QueryOptions): T[] {
    if (!options) return rows;
    let result = [...rows];

    if (options.sortBy) {
      const field = options.sortBy;
      const dir = options.sortDirection === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
        return 0;
      });
    }

    if (options.offset && options.offset > 0) {
      result = result.slice(options.offset);
    }

    if (options.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  }
}

export const googleSheetsClient = new GoogleSheetsClient();

