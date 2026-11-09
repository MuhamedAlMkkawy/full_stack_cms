import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/authStore";
import { useGlobalStore } from "~/stores/globalStore";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const globalStore = useGlobalStore();

  const lang = globalStore.lang || "en";
  const localePrefix = lang === "en" ? "" : `/${lang}`;

  const isLoginPage =
    to.path == "/login" || to.path == `${localePrefix}/login`;

  const authed = useCookie("authStore").value;

  // Logged in → block login page
  if (authed) {
    if (isLoginPage) {
      return navigateTo(`${localePrefix}/`);
    }
    return;
  }

  //Not logged in → force login
  if (!isLoginPage) {
    return navigateTo(`${localePrefix}/login`);
  }
});
