import { ref } from 'vue';
import { assetsRepository } from '../repositories/assets.repository';
import type { Asset } from '../services/google-sheets/googleSheetsTypes';

export function useAssets() {
  const uploading = ref(false);
  const error = ref<string | null>(null);

  const uploadAsset = async (
    fileOrUrl: File | string,
    metadata?: { organization_id?: string; project_id?: string; filename?: string }
  ): Promise<Asset> => {
    uploading.value = true;
    error.value = null;
    try {
      return await assetsRepository.uploadAsset(fileOrUrl, metadata);
    } catch (err: any) {
      error.value = err?.message || 'Failed to upload asset';
      throw err;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    error,
    uploadAsset,
  };
}

