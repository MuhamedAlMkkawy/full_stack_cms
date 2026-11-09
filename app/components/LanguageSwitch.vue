<template>
  <div
    class="languages-switch"
    :style="'direction: ' + locale.code === 'ar' ? 'rtl' : 'ltr'"
  >
    <NuxtLink
      v-for="locale in availableLocales"
      :key="locale.code"
      :to="switchLocalePath(locale.code)"
      @click="useGlobalStore().setLang(locale.code)"
    >
      <!-- <span>{{ locale.name }}</span> -->
      <span>{{ locale.code == "ar" ? "ع" : "En" }}</span>
      <i class="pi pi-globe"></i>
    </NuxtLink>
  </div>
</template>

<script setup>
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code != locale.value);
});
</script>

<style lang="scss" scoped></style>
