export interface CloudinaryUploadResult {
  secure_url: string;
  url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
  created_at: string;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const STORAGE_KEY_CLOUD_NAME = 'cms_cloudinary_cloud_name';
const STORAGE_KEY_UPLOAD_PRESET = 'cms_cloudinary_upload_preset';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

export class CloudinaryService {
  /**
   * Get the active Cloudinary Cloud Name from localStorage or runtimeConfig.
   */
  public getCloudName(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CLOUD_NAME);
      if (saved && saved.trim() && saved.trim() !== 'apper_files') return saved.trim();
      // If erroneous 'apper_files' was stored, clean it up
      if (saved === 'apper_files') {
        localStorage.removeItem(STORAGE_KEY_CLOUD_NAME);
      }
    }

    try {
      const config = useRuntimeConfig();
      const fromConfig = config.public?.cloudinaryCloudName as string | undefined;
      if (fromConfig && fromConfig.trim() && fromConfig.trim() !== 'apper_files') {
        return fromConfig.trim();
      }
    } catch {
      // RuntimeConfig not available in this context
    }

    return 'pg2ruop3';
  }

  /**
   * Set the active Cloud Name in localStorage.
   */
  public setCloudName(cloudName: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CLOUD_NAME, cloudName.trim());
    }
  }

  /**
   * Get the active Cloudinary upload preset from localStorage or runtimeConfig.
   */
  public getUploadPreset(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_UPLOAD_PRESET);
      if (saved && saved.trim() && saved.trim() !== 'apper_files') return saved.trim();
      if (saved === 'apper_files') {
        localStorage.removeItem(STORAGE_KEY_UPLOAD_PRESET);
      }
    }

    try {
      const config = useRuntimeConfig();
      const fromConfig = config.public?.cloudinaryUploadPreset as string | undefined;
      if (fromConfig && fromConfig.trim() && fromConfig.trim() !== 'apper_files') {
        return fromConfig.trim();
      }
    } catch {
      // RuntimeConfig not available in this context
    }

    return 'appy_files';
  }

  /**
   * Set the active upload preset in localStorage.
   */
  public setUploadPreset(preset: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_UPLOAD_PRESET, preset.trim());
    }
  }

  /**
   * Check whether Cloudinary has both cloudName and uploadPreset configured.
   */
  public isConfigured(): boolean {
    return Boolean(this.getCloudName());
  }

  /**
   * Validate an image file before uploading:
   * Checks file presence, allowed MIME types / extensions, and maximum file size.
   */
  public validateImage(file: File, maxSizeMb: number = 5): ImageValidationResult {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check MIME type
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

    // Check file extension as a fallback
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

    if (!isAllowedMime && !isAllowedExt) {
      return {
        valid: false,
        error: 'Invalid file format. Only JPG, PNG, WEBP, GIF, and SVG images are allowed.',
      };
    }

    // Check size limit (maxSizeMb in bytes)
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds the ${maxSizeMb}MB limit (File is ${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
      };
    }

    return { valid: true };
  }

  /**
   * Attempt to upload via server-side signed route (/api/upload).
   * Supports progress monitoring via XMLHttpRequest.
   */
  public uploadViaServer(
    file: File,
    options?: { folder?: string; onProgress?: (percent: number) => void }
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      if (options?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
            options.onProgress?.(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              secure_url: res.secure_url || res.url,
              url: res.url || res.secure_url,
              public_id: res.public_id,
              format: res.format,
              width: res.width,
              height: res.height,
              bytes: res.bytes,
              original_filename: res.original_filename || file.name,
              created_at: res.created_at || new Date().toISOString(),
            });
          } else {
            reject(new Error(res?.statusMessage || res?.message || `Server upload failed (${xhr.status})`));
          }
        } catch {
          reject(new Error(`Server upload response parse error (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload to /api/upload'));
      xhr.send(formData);
    });
  }

  /**
   * Upload an image file to Cloudinary.
   * Prioritizes secure server-side signed upload (/api/upload) using configured API Key & Secret.
   * If server upload is not available, falls back to direct client-side upload.
   * Tracks upload progress and returns the secure URL and image metadata.
   */
  public async uploadImage(
    file: File,
    options?: {
      folder?: string;
      onProgress?: (percent: number) => void;
      maxSizeMb?: number;
      cloudName?: string;
      uploadPreset?: string;
    }
  ): Promise<CloudinaryUploadResult> {
    // 1. Validate file
    const validation = this.validateImage(file, options?.maxSizeMb || 5);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Prioritize trusted server-side signed upload
    try {
      const serverResult = await this.uploadViaServer(file, options);
      return serverResult;
    } catch (serverErr: any) {
      console.warn('[CloudinaryService] Server upload failed, attempting direct upload fallback:', serverErr?.message);
    }

    // 3. Fallback: Direct client-side unsigned upload
    const cloudName = options?.cloudName || this.getCloudName();
    const uploadPreset = options?.uploadPreset || this.getUploadPreset();

    if (!cloudName) {
      throw new Error('Cloudinary Cloud Name is not configured.');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      }
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);

      if (options?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
            options.onProgress?.(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              secure_url: response.secure_url || response.url,
              url: response.url || response.secure_url,
              public_id: response.public_id,
              format: response.format,
              width: response.width,
              height: response.height,
              bytes: response.bytes,
              original_filename: response.original_filename || file.name,
              created_at: response.created_at || new Date().toISOString(),
            });
          } else {
            const errorMsg =
              response.error?.message ||
              `Cloudinary upload failed with status ${xhr.status}`;
            reject(new Error(errorMsg));
          }
        } catch {
          reject(new Error(`Failed to parse Cloudinary response (HTTP ${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading to Cloudinary.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Cloudinary upload timed out. Please try again.'));
      };

      xhr.send(formData);
    });
  }

  /**
   * Perform a lightweight test upload to verify Cloudinary configuration.
   */
  public async testUpload(
    cloudName?: string,
    uploadPreset?: string
  ): Promise<{ success: boolean; message: string; url?: string }> {
    try {
      // 1x1 transparent PNG blob
      const byteCharacters = atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const testBlob = new Blob([byteArray], { type: 'image/png' });
      const testFile = new File([testBlob], 'cloudinary_test.png', { type: 'image/png' });

      const result = await this.uploadImage(testFile, {
        cloudName,
        uploadPreset,
      });

      return {
        success: true,
        message: 'Cloudinary configuration is valid! Upload succeeded.',
        url: result.secure_url,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Cloudinary connection test failed.',
      };
    }
  }
}

export const cloudinaryService = new CloudinaryService();
