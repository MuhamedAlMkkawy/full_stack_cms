import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('globalStore' , () => {
  // define loading 
  const loading = ref(false);
  const switchLoading = (newLoading) => {
    loading.value = newLoading;
  };

  // define language
  const lang = ref(useCookie('language')?.value || 'en');
  const setLang = (newLang) => {
    lang.value = newLang;
    useCookie('language').value = newLang; // Store the language in a cookie
  }

  // handle device id 
  const device_id = ref(null);
  const handleDeviceID = (newDeviceID) => {
    device_id.value = newDeviceID;
  };

  // define if there is any notifications
  const isNotified = ref(false)
  const notifications = ref()

  // Expose state and actions
  return {
    loading,
    switchLoading,
    lang,
    setLang,
    device_id,
    handleDeviceID,
    isNotified,
    notifications,
  };
}, {
  persist: {
    storage: {
      getItem: (key) => {
        const cookie = useCookie(key, { maxAge: 86400 }); // 1 day in seconds
        return cookie.value ? JSON.parse(cookie.value) : null;
      },
      setItem: (key, value) => {
        const cookie = useCookie(key, { maxAge: 86400 });
        cookie.value = JSON.stringify(value);
      },
      removeItem: (key) => {
        const cookie = useCookie(key);
        cookie.value = null;
      }
    }
  }

});
