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

  const isPublicRoute =
    to.path.startsWith("/sites") ||
    to.path.startsWith(`${localePrefix}/sites`) ||
    to.path.startsWith("/published") ||
    to.path.startsWith(`${localePrefix}/published`);

  const authCookie = useCookie<any>("authStore").value;
  const authed = Boolean(
    authStore.user?.token ||
    (authCookie && typeof authCookie === "object" && authCookie?.user?.token)
  );

  // Public route → allow without login
  if (isPublicRoute) {
    return;
  }

  // Logged in → block login page
  if (authed) {
    if (isLoginPage) {
      return navigateTo(localePrefix ? `${localePrefix}/` : "/");
    }
    return;
  }

  // Not logged in → force login
  if (!isLoginPage) {
    return navigateTo(localePrefix ? `${localePrefix}/login` : "/login");
  }
});
