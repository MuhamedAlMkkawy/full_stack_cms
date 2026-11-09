<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
      <Loading v-if="useGlobalStore()?.loading" />
      <Toast />
      <!-- <ProjectControl v-if="useAuthStore()?.token && !$route.endsWith('/login')" /> -->
    </NuxtLayout>
  </div>
</template>

<script setup>
import Toast from "primevue/toast";

const { locale } = useI18n();
const currentDir = computed(() => (locale.value === "ar" ? "rtl" : "ltr"));

useHead({
  htmlAttrs: {
    lang: locale,
    dir: currentDir,
  },
});


// watchEffect(()=>{
//   console.log(useAuthStore()?.user)
// })
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.6s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  /* transform: scale(0.7) rotate(4deg); */
  transform: translateX(15px);
}
</style>
