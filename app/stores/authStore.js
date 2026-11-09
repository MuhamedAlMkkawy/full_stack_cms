// stores/authStore.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "authStore",
  () => {
    const user = ref({
      token: null,
      role: null,
      organization_id: null,
      user: null,
    });

    const handleUserData = (newUser) => {
      user.value.token = newUser?.token ?? null;
      user.value.role = newUser?.role ?? null;
      user.value.organization_id = newUser?.organization_id ?? user.value.organization_id ?? null;
      user.value.user = newUser?.user ?? user.value.user ?? null;
    };

    const clearUser = () => {
      user.value.token = null;
      user.value.role = null;
      user.value.organization_id = null;
      user.value.user = null;
    };

    return { user, handleUserData, clearUser };
  },
  {
    persist: true,
  },
);
