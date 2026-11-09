import { ref } from 'vue';
import { publishingRepository } from '../repositories/publishing.repository';
import type { PublishedSite } from '../services/google-sheets/googleSheetsTypes';

export function usePublishing() {
  const publishing = ref(false);
  const error = ref<string | null>(null);

  const publishProject = async (projectId: string, authorUserId?: string, comment?: string): Promise<PublishedSite> => {
    publishing.value = true;
    error.value = null;
    try {
      return await publishingRepository.publishProject(projectId, authorUserId, comment);
    } catch (err: any) {
      error.value = err?.message || 'Publishing failed';
      throw err;
    } finally {
      publishing.value = false;
    }
  };

  const unpublishProject = async (projectId: string): Promise<boolean> => {
    publishing.value = true;
    try {
      return await publishingRepository.unpublishProject(projectId);
    } finally {
      publishing.value = false;
    }
  };

  const getPublishedSnapshot = async (projectId: string): Promise<any | null> => {
    return await publishingRepository.getPublishedSnapshot(projectId);
  };

  return {
    publishing,
    error,
    publishProject,
    unpublishProject,
    getPublishedSnapshot,
  };
}

