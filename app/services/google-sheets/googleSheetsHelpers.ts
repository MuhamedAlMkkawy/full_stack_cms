/**
 * Generate a random UUID v4 using the standard Web Crypto API.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not supported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert a zero-based column index to an A1-notation column letter (e.g., 0 -> 'A', 27 -> 'AB').
 */
export function columnToLetter(colIndex: number): string {
  let temp: number;
  let letter = '';
  colIndex += 1;
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = Math.floor((colIndex - temp - 1) / 26);
  }
  return letter;
}

/**
 * Convert an A1 column letter to a zero-based column index (e.g., 'A' -> 0, 'Z' -> 25, 'AA' -> 26).
 */
export function letterToColumn(letter: string): number {
  let column = 0;
  const length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column - 1;
}

/**
 * Parse a raw row array from Google Sheets into a typed object using headers.
 */
export function rowToObject<T extends Record<string, any>>(headers: string[], row: any[]): T {
  const obj: Record<string, any> = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const val = row[i];

    if (val === undefined || val === null || val === '') {
      obj[key] = (key.endsWith('_json')) ? (key.includes('layout') || key.includes('components') ? '[]' : '{}') : '';
      if (key === 'visible' || key === 'is_public' || key === 'verified') {
        obj[key] = false;
      } else if (key === 'order' || key === 'size' || key === 'version') {
        obj[key] = 0;
      }
      continue;
    }

    if (key === 'visible' || key === 'is_public' || key === 'verified') {
      obj[key] = String(val).toLowerCase() === 'true' || val === true || val === 1 || val === '1';
    } else if (key === 'order' || key === 'size' || key === 'version') {
      const num = Number(val);
      obj[key] = isNaN(num) ? 0 : num;
    } else {
      obj[key] = String(val);
    }
  }
  return obj as T;
}

/**
 * Convert an object into a 1D row array matching the provided headers order.
 */
export function objectToRow(headers: string[], obj: Record<string, any>): (string | number | boolean)[] {
  return headers.map((key) => {
    const val = obj[key];
    if (val === undefined || val === null) {
      return '';
    }
    if (typeof val === 'boolean') {
      return val ? 'TRUE' : 'FALSE';
    }
    if (typeof val === 'number') {
      return val;
    }
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  });
}

/**
 * Generate a cryptographically secure random 16-byte salt as a hex string.
 */
export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Hash a password with a salt using Web Crypto PBKDF2 (100,000 iterations, SHA-256).
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Basic fallback for non-crypto environments
    return btoa(password + ':' + salt);
  }

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against a stored hash and salt.
 */
export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Generic retry with exponential backoff for handling rate limits (HTTP 429) and network hiccups.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      const isRateLimited = err?.status === 429 || err?.response?.status === 429 || String(err).includes('429');
      const delay = (isRateLimited ? baseDelayMs * 2 : baseDelayMs) * Math.pow(2, attempt - 1);
      console.warn(`[GoogleSheets] Retrying operation (attempt ${attempt}/${maxRetries}) after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Standard debounce function.
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: any = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

