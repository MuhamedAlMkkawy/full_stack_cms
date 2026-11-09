// stores/authStore.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "authStore",
  () => {
    const user = ref({ token: null, role: null });

    const handleUserData = (newUser) => {
      user.value.token = newUser?.token;
      user.value.role = newUser?.role;
    };

    return { user, handleUserData };
  },
  {
    persist: true,
  },
);
