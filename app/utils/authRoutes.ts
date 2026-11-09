export const AUTH_ROUTE_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

export function isAuthRoute(path: string): boolean {
  const normalized = (path || "").replace(/\/+$/, "") || "/";
  return AUTH_ROUTE_PATHS.some(
    (route) => normalized === route || normalized.endsWith(route)
  );
}
