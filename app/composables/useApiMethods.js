import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores/globalStore';
import { useAuthStore } from '@/stores/authStore';
import { useToastMsg } from '@/composables/useToastMsg';
import { useAuth } from '@/composables/useAuth';
import { projectsRepository } from '@/repositories/projects.repository';
import { pagesRepository } from '@/repositories/pages.repository';
import { assetsRepository } from '@/repositories/assets.repository';
import { componentDefinitionsRepository } from '@/repositories/componentDefinitions.repository';

export function useApiMethods() {
  const globalStore = useGlobalStore();
  const authStore = useAuthStore();
  const router = useRouter();
  const localeRoute = useLocaleRoute();
  const { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } = useToastMsg();
  const { loginWithCredentials, logout } = useAuth();

  const handleNextRoute = async (nextRoute) => {
    setTimeout(() => {
      if (nextRoute === 'reload_page') {
        router.go(0);
      } else if (nextRoute === 'unAuthed') {
        useCookie('authStore').value = null;
        router.push(localeRoute('/login'));
      } else {
        router.push(localeRoute(nextRoute));
      }
    }, 400);
  };

  const handleToastMsg = (type, message) => {
    globalStore.switchLoading(false);
    if (!message) return;
    if (type === 'success') {
      showSuccessToast(message);
    } else if (type === 'info') {
      showInfoToast(message);
    } else if (type === 'warn') {
      showWarnToast(message);
    } else {
      showErrorToast(message);
    }
  };

  const getResult = ref(null);

  /**
   * Centralized GET dispatcher for Google Sheets Repositories.
   */
  const getMethod = async (apiUrl, pageNumber, authed, showToast) => {
    globalStore.switchLoading(true);
    getResult.value = null;

    try {
      const cleanUrl = apiUrl.replace(/^\/+/, '').split('?')[0];

      let responseData = null;

      if (cleanUrl === 'statistics') {
        responseData = await projectsRepository.getDashboardStatistics();
      } else if (cleanUrl === 'projects') {
        responseData = await projectsRepository.getProjectsList(undefined, globalStore.lang);
      } else if (cleanUrl.startsWith('projects/') && !cleanUrl.includes('/pages')) {
        const projectId = cleanUrl.replace('projects/', '');
        responseData = await projectsRepository.getProjectTree(projectId, globalStore.lang);
      } else if (cleanUrl === 'components') {
        responseData = await componentDefinitionsRepository.getAvailableComponents();
      } else {
        console.warn(`[useApiMethods] Unhandled GET route for Google Sheets: "${apiUrl}"`);
        responseData = [];
      }

      const res = {
        status: 'success',
        data: responseData,
        message: 'Loaded successfully',
      };

      getResult.value = res;
      globalStore.switchLoading(false);
      if (showToast) {
        handleToastMsg(res.status, res.message);
      }
    } catch (err) {
      console.error(`[useApiMethods] Error in getMethod ("${apiUrl}"):`, err);
      globalStore.switchLoading(false);
      handleToastMsg('error', err?.message || 'Error fetching data from Google Sheets');
    }
  };

  const submitResult = ref(null);

  /**
   * Centralized SUBMIT dispatcher for Google Sheets Repositories.
   */
  const submitMethod = async (
    endPoint,
    authed,
    payload,
    method = 'POST',
    nextRoute,
    refetchApi
  ) => {
    globalStore.switchLoading(true);
    submitResult.value = null;

    try {
      const cleanEndpoint = endPoint.replace(/^\/+/, '');
      let resultData = null;
      let successMessage = 'Operation completed successfully';

      // 1. Handle Login
      if (cleanEndpoint.endsWith('login')) {
        const email = payload.email;
        const password = payload.password;
        const success = await loginWithCredentials(email, password);
        if (!success) {
          throw new Error('Invalid email or password');
        }
        resultData = authStore.user;
        successMessage = 'Logged in successfully';
      }
      // 2. Handle Logout
      else if (cleanEndpoint.endsWith('logout')) {
        await logout();
        handleNextRoute('unAuthed');
        globalStore.switchLoading(false);
        return;
      }
      // 3. Handle File Upload (Asset)
      else if (cleanEndpoint.includes('uploads')) {
        let file = null;
        if (payload instanceof FormData) {
          file = payload.get('file');
        } else if (payload?.file) {
          file = payload.file;
        }

        if (file) {
          const asset = await assetsRepository.uploadAsset(file);
          resultData = { path: asset.url };
          successMessage = 'Uploaded successfully';
        } else {
          throw new Error('No file provided for upload');
        }
      }
      // 4. Handle Save Page Content (PATCH /projects/:id/pages/:pageId or POST /projects/:id/pages)
      else if (cleanEndpoint.includes('pages')) {
        const segments = cleanEndpoint.split('/');
        const projectIdIndex = segments.indexOf('projects') + 1;
        const projectId = segments[projectIdIndex];

        resultData = await pagesRepository.savePageWithSections(projectId, payload);
        successMessage = 'Page saved successfully';
      }
      // 5. Handle Draft Toggle (PATCH projects/:id)
      else if (cleanEndpoint.startsWith('projects/') && method === 'PATCH') {
        const projectId = cleanEndpoint.replace('projects/', '');
        const visible = payload.visible;
        resultData = await projectsRepository.toggleVisibility(projectId, visible);
        successMessage = visible ? 'Project published to draft' : 'Project hidden';
      }
      // 6. Handle Create Project (POST projects or /projects)
      else if (cleanEndpoint === 'projects' && method === 'POST') {
        let nameAr = '';
        let nameEn = '';
        let descAr = '';
        let descEn = '';
        let logo = '';

        if (payload instanceof FormData) {
          logo = payload.get('logo');
          nameAr = payload.get('name.ar') || payload.get('ar_name');
          nameEn = payload.get('name.en') || payload.get('en_name');
          descAr = payload.get('description.ar') || payload.get('ar_description');
          descEn = payload.get('description.en') || payload.get('en_description');
        } else {
          logo = payload.logo;
          nameAr = payload?.name?.ar || payload?.ar_name || '';
          nameEn = payload?.name?.en || payload?.en_name || '';
          descAr = payload?.description?.ar || payload?.ar_description || '';
          descEn = payload?.description?.en || payload?.en_description || '';
        }

        resultData = await projectsRepository.create({
          name_ar: nameAr,
          name_en: nameEn,
          description_ar: descAr,
          description_en: descEn,
          logo: logo || '',
          visible: true,
        });
        successMessage = 'Project created successfully';
      } else {
        console.warn(`[useApiMethods] Unhandled submit endpoint for Google Sheets: "${endPoint}"`);
      }

      const res = {
        status: 'success',
        data: resultData,
        message: successMessage,
      };

      submitResult.value = res;
      handleToastMsg('success', successMessage);

      if (nextRoute) {
        handleNextRoute(nextRoute);
      }
      if (refetchApi) {
        getMethod(refetchApi, '', authed, false);
      }

      globalStore.switchLoading(false);
    } catch (err) {
      console.error(`[useApiMethods] Error in submitMethod ("${endPoint}"):`, err);
      globalStore.switchLoading(false);
      handleToastMsg('error', err?.message || 'Operation failed');
    }
  };

  return {
    getMethod,
    getResult,
    submitMethod,
    submitResult,
    showErrorToast,
    handleNextRoute,
  };
}
