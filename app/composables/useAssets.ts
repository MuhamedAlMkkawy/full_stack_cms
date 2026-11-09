import { ref } from 'vue';
import { assetsRepository } from '../repositories/assets.repository';
import type { Asset } from '../services/google-sheets/googleSheetsTypes';

export function useAssets() {
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref<string | null>(null);

  /**
   * Upload asset to Cloudinary and register metadata in Google Sheets.
   */
  const uploadAsset = async (
    fileOrUrl: File | string,
    metadata?: { organization_id?: string; project_id?: string; filename?: string; folder?: string },
    onProgress?: (percent: number) => void
  ): Promise<Asset> => {
    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      const asset = await assetsRepository.uploadAsset(fileOrUrl, metadata, (percent) => {
        uploadProgress.value = percent;
        if (onProgress) {
          onProgress(percent);
        }
      });
      return asset;
    } catch (err: any) {
      error.value = err?.message || 'Failed to upload asset';
      throw err;
    } finally {
      uploading.value = false;
    }
  };

  /**
   * Delete an asset from Google Sheets by URL or ID.
   */
  const deleteAsset = async (urlOrId: string): Promise<boolean> => {
    error.value = null;
    try {
      if (urlOrId.startsWith('http')) {
        return await assetsRepository.deleteByUrl(urlOrId);
      } else {
        return await assetsRepository.delete(urlOrId);
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to delete asset';
      throw err;
    }
  };

  return {
    uploading,
    uploadProgress,
    error,
    uploadAsset,
    deleteAsset,
  };
}
