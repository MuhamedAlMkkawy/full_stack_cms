import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/globalStore";
import { useAuthStore } from "@/stores/authStore";
import { useToastMsg } from "@/composables/useToastMsg";
import { fetchApiData, submitApiForm } from "@/composables/useApiFetch";
import { ref } from "vue";

export function useApiMethods() {
  // define global store
  const globalStore = useGlobalStore();

  // define auth store
  const authStore = useAuthStore();

  // define router
  const router = useRouter();

  // define local route
  const localeRoute = useLocaleRoute();

  // define useToastMsg
  const { showErrorToast, showSuccessToast, showInfoToast, showWarnToast } =
    useToastMsg();

  // define handle the next route
  const handleNextRoute = async (nextRoute) => {
    setTimeout(() => {
      if (nextRoute == "reload_page") {
        router.go(0);
      } else if (nextRoute == "unAuthed") {
        useCookie("authStore").value = null;
        router.push(localeRoute("/login"));
      } else {
        router.push(localeRoute(nextRoute));
      }
    }, 500);
  };

  // define handle the toast message and its type
  const handleToastMsg = (type, message) => {
    // to stop the loading while showing the message
    globalStore.switchLoading(false);
    if (type == "success") {
      showSuccessToast(message);
    } else if (type == "info") {
      showInfoToast(message);
    } else if (type == "warn") {
      showWarnToast(message);
    } else {
      showErrorToast(message);
    }
  };

  // Fetch Data
  const getResult = ref(null);
  const getMethod = async (apiUrl, pageNumber, authed, showToast) => {
    globalStore.switchLoading(true);
    getResult.value = null;

    const { data, error } = await fetchApiData(
      `${apiUrl}${
        pageNumber
          ? `${apiUrl.includes("?") ? "&" : "?"}page=${pageNumber}`
          : ""
      }`,
      authed,
    );

    // ${authStore?.userData ? `?device_id=${globalStore.device_id}&` : apiUrl.startsWith('search?') ? '&' : '?' }
    if (error) {
      handleToastMsg("error", error?.response?._data?.message);
      if (error?.response?._data?.error === "Unauthorized") {
        handleNextRoute("unAuthed");
      }
    } else {
      if (data.status == "success") {
        getResult.value = data;
      }
      globalStore.switchLoading(false);
      if (showToast) {
        handleToastMsg(data?.status, data?.message);
      }
    }
  };

  // submit form function
  const submitResult = ref(null);
  const submitMethod = async (
    endPoint,
    authed,
    payload,
    method,
    nextRoute,
    refetchApi,
  ) => {
    globalStore.switchLoading(true);
    const { data, error } = await submitApiForm(
      endPoint,
      authed,
      payload,
      method,
    );

    if (error) {
      handleToastMsg("error", error?.response?._data?.message);
      if (error?.response?._data?.error === "Unauthorized") {
        handleNextRoute("unAuthed");
      }
    } else {
      if (endPoint.endsWith("login") && data) {
        authStore?.handleUserData(data?.data);
        // console.log(data?.data);
      }
      else if (endPoint.endsWith("logout")) {
        handleNextRoute("unAuthed");
      }
      if (nextRoute) {
        handleNextRoute(nextRoute);
      }
      if (refetchApi) {
        getMethod(refetchApi, "", authStore ? true : false, false);
      }

      submitResult.value = data;
      handleToastMsg(data?.status, data?.message);
      globalStore.switchLoading(false);
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
