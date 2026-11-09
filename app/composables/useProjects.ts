import { ref } from 'vue';
import { projectsRepository, type ProjectWithTree } from '../repositories/projects.repository';
import type { Project } from '../services/google-sheets/googleSheetsTypes';
import { useGlobalStore } from '../stores/globalStore';

export function useProjects() {
  const projects = ref<any[]>([]);
  const currentProject = ref<ProjectWithTree | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const globalStore = useGlobalStore();

  const fetchProjects = async (organizationId?: string) => {
    loading.value = true;
    error.value = null;
    try {
      const lang = globalStore?.lang || 'ar';
      projects.value = await projectsRepository.getProjectsList(organizationId, lang);
      return projects.value;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch projects';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchProjectTree = async (projectId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const lang = globalStore?.lang || 'ar';
      const tree = await projectsRepository.getProjectTree(projectId, lang);
      currentProject.value = tree;
      return tree;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch project tree';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (payload: {
    logo: string;
    name_ar?: string;
    name_en?: string;
    description_ar?: string;
    description_en?: string;
    organization_id?: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const newProject = await projectsRepository.create({
        name_ar: payload.name_ar || '',
        name_en: payload.name_en || '',
        description_ar: payload.description_ar || '',
        description_en: payload.description_en || '',
        logo: payload.logo || '',
        visible: true,
        organization_id: payload.organization_id || '',
      });
      return newProject;
    } catch (err: any) {
      error.value = err?.message || 'Failed to create project';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const toggleVisibility = async (projectId: string, visible: boolean) => {
    loading.value = true;
    try {
      const updated = await projectsRepository.toggleVisibility(projectId, visible);
      const index = projects.value.findIndex((p) => p.id === projectId || p._id === projectId);
      if (index !== -1) {
        projects.value[index].visible = visible;
      }
      return updated;
    } finally {
      loading.value = false;
    }
  };

  const fetchStatistics = async (organizationId?: string) => {
    loading.value = true;
    try {
      return await projectsRepository.getDashboardStatistics(organizationId);
    } finally {
      loading.value = false;
    }
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectTree,
    createProject,
    toggleVisibility,
    fetchStatistics,
  };
}

