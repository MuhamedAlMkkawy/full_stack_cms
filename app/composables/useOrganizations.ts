import { ref } from 'vue';
import { organizationsRepository } from '../repositories/organizations.repository';
import type { Organization } from '../services/google-sheets/googleSheetsTypes';

export function useOrganizations() {
  const organizations = ref<Organization[]>([]);
  const currentOrg = ref<Organization | null>(null);
  const loading = ref(false);

  const fetchUserOrganizations = async (userId: string) => {
    loading.value = true;
    try {
      const orgList = await organizationsRepository.getUserOrganizations(userId);
      organizations.value = orgList.map((item) => item.organization);
      if (organizations.value.length > 0 && !currentOrg.value) {
        currentOrg.value = organizations.value[0];
      }
    } finally {
      loading.value = false;
    }
  };

  const createOrganization = async (data: Partial<Organization>, userId: string) => {
    loading.value = true;
    try {
      const org = await organizationsRepository.create(data);
      await organizationsRepository.addMember(org.id, userId, 'owner');
      organizations.value.push(org);
      currentOrg.value = org;
      return org;
    } finally {
      loading.value = false;
    }
  };

  return {
    organizations,
    currentOrg,
    loading,
    fetchUserOrganizations,
    createOrganization,
  };
}

