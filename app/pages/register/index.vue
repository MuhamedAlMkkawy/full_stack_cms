<template>
  <div class="auth_page page">
    <div class="container">
      <VeeForm
        :validation-schema="registerSchema"
        @submit="handleSubmit"
        class="auth_form"
      >
        <h2>{{ $t("auth_pages.register_title") }}</h2>
        <p class="auth_subtitle">{{ $t("auth_pages.register_subtitle") }}</p>

        <CustomField
          name="name"
          type="text"
          :label="$t('auth_pages.name')"
          :placeholder="$t('auth_pages.namePlaceholder')"
        />
        <CustomField
          name="email"
          type="email"
          :label="$t('login_page.email')"
          :placeholder="$t('login_page.emailPlaceholder')"
        />
        <CustomField
          name="password"
          type="password"
          :label="$t('login_page.password')"
          :placeholder="$t('login_page.passwordPlaceholder')"
        />
        <CustomField
          name="confirmPassword"
          type="password"
          :label="$t('auth_pages.confirmPassword')"
          :placeholder="$t('auth_pages.confirmPasswordPlaceholder')"
        />

        <button class="main-btn" type="submit">
          {{ $t("auth_pages.register_submit") }}
        </button>
        <button
          type="button"
          class="main-btn google-btn"
          @click="handleGoogleSignIn"
        >
          <i class="pi pi-google"></i>
          <span>{{ $t("auth_pages.google_continue") }}</span>
        </button>

        <p v-if="error" class="auth_error">{{ error }}</p>
        <AuthNav current="register" />
        <GoogleClientSetup />
      </VeeForm>
    </div>
  </div>
</template>

<script setup>
const registerSchema = useRegisterSchema();
const { registerWithCredentials, loginWithGoogle, error } = useAuth();
const router = useRouter();
const localeRoute = useLocaleRoute();

const handleSubmit = async (values) => {
  const success = await registerWithCredentials(
    values.name,
    values.email,
    values.password
  );
  if (success) {
    router.push(localeRoute("/"));
  }
};

const handleGoogleSignIn = async () => {
  const success = await loginWithGoogle();
  if (success) {
    router.push(localeRoute("/"));
  }
};
</script>
