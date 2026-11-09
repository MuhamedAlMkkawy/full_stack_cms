import { GOOGLE_OAUTH_SCOPES } from './googleSheetsConfig';
import type { GoogleTokenResponse } from './googleSheetsTypes';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
          }): {
            requestAccessToken(overrideConfig?: { prompt?: string }): void;
          };
        };
      };
    };
  }
}

const STORAGE_KEY_TOKEN = 'cms_google_access_token';
const STORAGE_KEY_EXPIRES = 'cms_google_token_expires_at';
const STORAGE_KEY_CLIENT_ID = 'cms_google_client_id';
const CLIENT_ID_PATTERN = /\.apps\.googleusercontent\.com$/;

export const GOOGLE_CLIENT_ID_ERROR =
  'Please configure a valid Google Cloud OAuth Client ID to authenticate.';

export class GoogleClientIdError extends Error {
  constructor(message = GOOGLE_CLIENT_ID_ERROR) {
    super(message);
    this.name = 'GoogleClientIdError';
  }
}

class GoogleSheetsAuthService {
  private tokenClient: any = null;
  private loadPromise: Promise<void> | null = null;
  private tokenResolveCallback: ((token: string) => void) | null = null;
  private tokenRejectCallback: ((err: any) => void) | null = null;

  /**
   * Load Google Identity Services (GIS) client library asynchronously.
   */
  public async loadGIS(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts?.oauth2) return;

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-gis-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (err) => reject(err));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gis-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(new Error('Failed to load Google Identity Services library.'));
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  public isValidClientId(clientId?: string | null): boolean {
    return Boolean(clientId && CLIENT_ID_PATTERN.test(clientId.trim()));
  }

  /**
   * Retrieve active Client ID from config, localStorage, or runtime.
   */
  public getClientId(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
      if (this.isValidClientId(saved)) return saved!.trim();
    }
    try {
      const config = useRuntimeConfig();
      const fromConfig = config.public?.googleClientId as string | undefined;
      if (this.isValidClientId(fromConfig)) {
        return fromConfig!.trim();
      }
    } catch {
      // RuntimeConfig not ready or in non-Nuxt context
    }
    return '';
  }

  /**
   * Set custom Client ID manually (e.g. from settings popup or prompt).
   */
  public setClientId(clientId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
      this.tokenClient = null; // Re-initialize with new ID
    }
  }

  /**
   * Initialize or retrieve the GIS Token Client.
   */
  public async initTokenClient(clientId?: string): Promise<any> {
    await this.loadGIS();
    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not loaded.');
    }

    const effectiveClientId = clientId || this.getClientId();
    if (!this.isValidClientId(effectiveClientId)) {
      console.warn('[GoogleSheetsAuth] No Google Client ID configured yet.');
      return null;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveClientId,
      scope: GOOGLE_OAUTH_SCOPES.join(' '),
      callback: (tokenResponse: GoogleTokenResponse) => {
        if (tokenResponse.error) {
          console.error('[GoogleSheetsAuth] Token response error:', tokenResponse);
          if (this.tokenRejectCallback) {
            this.tokenRejectCallback(new Error(tokenResponse.error));
            this.tokenRejectCallback = null;
          }
          return;
        }

        const expiresIn = tokenResponse.expires_in || 3600;
        this.saveAccessToken(tokenResponse.access_token, expiresIn);

        if (this.tokenResolveCallback) {
          this.tokenResolveCallback(tokenResponse.access_token);
          this.tokenResolveCallback = null;
        }
      },
      error_callback: (err: any) => {
        console.error('[GoogleSheetsAuth] OAuth error:', err);
        if (this.tokenRejectCallback) {
          this.tokenRejectCallback(err);
          this.tokenRejectCallback = null;
        }
      }
    });

    return this.tokenClient;
  }

  /**
   * Request Google OAuth 2.0 access token via GIS popup.
   */
  public async requestAccessToken(promptConsent = false): Promise<string> {
    const existing = this.getValidAccessToken();
    if (existing && !promptConsent) {
      return existing;
    }

    if (!this.tokenClient) {
      await this.initTokenClient();
    }

    if (!this.tokenClient) {
      throw new GoogleClientIdError();
    }

    return new Promise((resolve, reject) => {
      this.tokenResolveCallback = resolve;
      this.tokenRejectCallback = reject;

      try {
        this.tokenClient.requestAccessToken({
          prompt: promptConsent ? 'consent' : '',
        });
      } catch (err) {
        this.tokenResolveCallback = null;
        this.tokenRejectCallback = null;
        reject(err);
      }
    });
  }

  /**
   * Save access token and expiration timestamp.
   */
  public saveAccessToken(token: string, expiresInSeconds: number): void {
    if (typeof window === 'undefined') return;
    const expiresAt = Date.now() + (expiresInSeconds - 60) * 1000; // 60s buffer
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_EXPIRES, expiresAt.toString());
  }

  /**
   * Get valid unexpired access token if available.
   */
  public getValidAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiresAtStr = localStorage.getItem(STORAGE_KEY_EXPIRES);

    if (!token || !expiresAtStr) return null;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() >= expiresAt) {
      this.clearAccessToken();
      return null;
    }
    return token;
  }

  /**
   * Check if user is currently authenticated with Google.
   */
  public isAuthenticated(): boolean {
    return this.getValidAccessToken() !== null;
  }

  /**
   * Revoke/clear Google OAuth tokens.
   */
  public clearAccessToken(): void {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (token && window.google?.accounts?.oauth2) {
      try {
        window.google.accounts.oauth2.revoke(token, () => {
          // Token revoked in Google backend
        });
      } catch {
        // Ignore revocation errors during logout
      }
    }
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
  }
}

export const googleSheetsAuth = new GoogleSheetsAuthService();

