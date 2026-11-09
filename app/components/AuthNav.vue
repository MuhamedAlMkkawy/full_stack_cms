<template>
  <nav class="auth_nav">
    <NuxtLink v-if="current !== 'login'" :to="$localeRoute('/login')">
      {{ $t("auth_pages.login_link") }}
    </NuxtLink>
    <NuxtLink v-if="current !== 'register'" :to="$localeRoute('/register')">
      {{ $t("auth_pages.register_link") }}
    </NuxtLink>
    <NuxtLink
      v-if="current !== 'forgot-password'"
      :to="$localeRoute('/forgot-password')"
    >
      {{ $t("auth_pages.forgot_link") }}
    </NuxtLink>
  </nav>
</template>

<script setup>
defineProps({
  current: {
    type: String,
    required: true,
  },
});
</script>
