import { ref } from 'vue';
import { pagesRepository } from '../repositories/pages.repository';
import type { Page } from '../services/google-sheets/googleSheetsTypes';
import { debounce } from '../services/google-sheets/googleSheetsHelpers';

export function usePages() {
  const pages = ref<Page[]>([]);
  const saving = ref(false);
  const error = ref<string | null>(null);

  const fetchPages = async (projectId: string) => {
    try {
      pages.value = await pagesRepository.getByProjectId(projectId);
      return pages.value;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch pages';
      throw err;
    }
  };

  const savePage = async (projectId: string, pagePayload: any) => {
    saving.value = true;
    error.value = null;
    try {
      const saved = await pagesRepository.savePageWithSections(projectId, pagePayload);
      return saved;
    } catch (err: any) {
      error.value = err?.message || 'Failed to save page';
      throw err;
    } finally {
      saving.value = false;
    }
  };

  /**
   * Debounced autosave (1500ms delay) to prevent excessive Google Sheets API calls during editing.
   */
  const debouncedSavePage = debounce(
    (projectId: string, pagePayload: any, callback?: (saved: any) => void) => {
      savePage(projectId, pagePayload)
        .then((res) => {
          if (callback) callback(res);
        })
        .catch((err) => {
          console.error('[usePages] Autosave error:', err);
        });
    },
    1500
  );

  return {
    pages,
    saving,
    error,
    fetchPages,
    savePage,
    debouncedSavePage,
  };
}

