import { googleSheetsClient, GoogleSheetsClient } from '../services/google-sheets/googleSheetsClient';
import type { WorksheetName } from '../services/google-sheets/googleSheetsConfig';
import type { SheetRow, QueryOptions } from '../services/google-sheets/googleSheetsTypes';

export abstract class BaseRepository<T extends SheetRow> {
  protected readonly sheetName: WorksheetName;
  protected readonly client: GoogleSheetsClient;

  constructor(sheetName: WorksheetName, client: GoogleSheetsClient = googleSheetsClient) {
    this.sheetName = sheetName;
    this.client = client;
  }

  /**
   * Get all entities from this repository's worksheet.
   */
  public async findAll(options?: QueryOptions): Promise<T[]> {
    return await this.client.getRows<T>(this.sheetName, options);
  }

  /**
   * Find an entity by its UUID.
   */
  public async findById(id: string): Promise<T | null> {
    return await this.client.getRowById<T>(this.sheetName, id);
  }

  /**
   * Find entities matching a predicate.
   */
  public async findWhere(predicate: (item: T) => boolean, options?: QueryOptions): Promise<T[]> {
    return await this.client.findRows<T>(this.sheetName, predicate, options);
  }

  /**
   * Create a new entity in the worksheet.
   */
  public async create(data: Partial<T>): Promise<T> {
    return await this.client.createRow<T>(this.sheetName, data);
  }

  /**
   * Update an existing entity by its UUID.
   */
  public async update(id: string, partialData: Partial<T>): Promise<T> {
    return await this.client.updateRow<T>(this.sheetName, id, partialData);
  }

  /**
   * Delete an entity by its UUID.
   */
  public async delete(id: string): Promise<boolean> {
    return await this.client.deleteRow(this.sheetName, id);
  }

  /**
   * Batch create multiple entities in a single API call.
   */
  public async batchCreate(items: Partial<T>[]): Promise<T[]> {
    return await this.client.batchCreate<T>(this.sheetName, items);
  }

  /**
   * Clear cache for this repository.
   */
  public invalidateCache(): void {
    this.client.invalidateCache(this.sheetName);
  }
}

