<template>
  <nav class="auth_nav_tabs">
    <NuxtLink
      :to="$localeRoute('/login')"
      :class="['tab_link', { active: current === 'login' }]"
    >
      {{ $t("auth_pages.login_tab") }}
    </NuxtLink>
    <NuxtLink
      :to="$localeRoute('/register')"
      :class="['tab_link', { active: current === 'register' }]"
    >
      {{ $t("auth_pages.register_tab") }}
    </NuxtLink>
    <NuxtLink
      :to="$localeRoute('/forgot-password')"
      :class="['tab_link', { active: current === 'forgot-password' }]"
    >
      {{ $t("auth_pages.forgot_tab") }}
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

<style lang="scss" scoped>
.auth_nav_tabs {
  display: flex;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 10px;
  margin-bottom: 24px;
  gap: 4px;

  .tab_link {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      color: #007593;
    }

    &.active {
      background: #ffffff;
      color: #007593;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
