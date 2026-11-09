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
      if (saved && saved.trim()) return saved.trim();
    }

    try {
      const config = useRuntimeConfig();
      const fromConfig = config.public?.cloudinaryCloudName as string | undefined;
      if (fromConfig && fromConfig.trim()) {
        return fromConfig.trim();
      }
    } catch {
      // RuntimeConfig not available in this context
    }

    return '';
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
   * Get the active Cloudinary unsigned upload preset from localStorage or runtimeConfig.
   */
  public getUploadPreset(): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_UPLOAD_PRESET);
      if (saved && saved.trim()) return saved.trim();
    }

    try {
      const config = useRuntimeConfig();
      const fromConfig = config.public?.cloudinaryUploadPreset as string | undefined;
      if (fromConfig && fromConfig.trim()) {
        return fromConfig.trim();
      }
    } catch {
      // RuntimeConfig not available in this context
    }

    return '';
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
    return Boolean(this.getCloudName() && this.getUploadPreset());
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
   * Upload an image file directly to Cloudinary using an unsigned upload preset.
   * Tracks upload progress and returns the secure URL and image metadata.
   * NEVER exposes API secrets in browser code.
   */
  public uploadImage(
    file: File,
    options?: {
      folder?: string;
      onProgress?: (percent: number) => void;
      maxSizeMb?: number;
    }
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      // 1. Validate file
      const validation = this.validateImage(file, options?.maxSizeMb || 5);
      if (!validation.valid) {
        return reject(new Error(validation.error));
      }

      // 2. Validate configuration
      const cloudName = this.getCloudName();
      const uploadPreset = this.getUploadPreset();

      if (!cloudName || !uploadPreset) {
        return reject(
          new Error(
            'Cloudinary is not configured. Please provide your Cloud Name and Unsigned Upload Preset in settings.'
          )
        );
      }

      // 3. Prepare payload for unsigned upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;

      // 4. Perform upload with XMLHttpRequest to monitor upload progress
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
        } catch (e: any) {
          reject(new Error(`Failed to parse Cloudinary response: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading to Cloudinary. Check your internet connection.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Cloudinary upload timed out. Please try again.'));
      };

      xhr.send(formData);
    });
  }
}

export const cloudinaryService = new CloudinaryService();

