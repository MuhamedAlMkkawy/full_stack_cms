import { ref } from 'vue';
import { sectionsRepository } from '../repositories/sections.repository';
import type { Section } from '../services/google-sheets/googleSheetsTypes';

export function useSections() {
  const sections = ref<Section[]>([]);
  const loading = ref(false);

  const fetchSections = async (pageId: string) => {
    loading.value = true;
    try {
      sections.value = await sectionsRepository.getByPageId(pageId);
      return sections.value;
    } finally {
      loading.value = false;
    }
  };

  const updateComponents = async (sectionId: string, components: any[]) => {
    return await sectionsRepository.updateComponents(sectionId, components);
  };

  return {
    sections,
    loading,
    fetchSections,
    updateComponents,
  };
}

