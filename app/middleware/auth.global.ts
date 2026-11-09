import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/authStore";
import { useGlobalStore } from "~/stores/globalStore";
import { isAuthRoute } from "~/utils/authRoutes";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const globalStore = useGlobalStore();

  const lang = globalStore.lang || "en";
  const localePrefix = lang === "en" ? "" : `/${lang}`;

  const isAuthPage = isAuthRoute(to.path);

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

  // Logged in → block auth pages
  if (authed) {
    if (isAuthPage) {
      return navigateTo(localePrefix ? `${localePrefix}/` : "/");
    }
    return;
  }

  // Not logged in → allow any auth page, otherwise force login
  if (!isAuthPage) {
    return navigateTo(localePrefix ? `${localePrefix}/login` : "/login");
  }
});
