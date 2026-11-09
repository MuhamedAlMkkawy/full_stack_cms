import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

export function useToastMsg() {
  const toast = useToast();
  const { t } = useI18n(); // i18n translation function

  const showToast = (severity, summary, detail, life = 1000) => {
    toast.add({ severity, summary, detail, life });
  };

  const showErrorToast = (message) => {
    showToast("error", t("toast.error"), message);
  };

  const showSuccessToast = (message) => {
    showToast("success", t("toast.success"), message);
  };

  const showInfoToast = (message) => {
    showToast("info", t("toast.info"), message);
  };

  const showWarnToast = (message) => {
    showToast("warn", t("toast.warn"), message);
  };

  return {
    toast,
    showErrorToast,
    showSuccessToast,
    showInfoToast,
    showWarnToast,
  };
}
