<template>
  <div class="auth_page page">
    <div class="container">
      <VeeForm
        :validation-schema="loginSchema"
        @submit="handleSubmit"
        class="auth_form"
      >
        <h2>{{ $t("login_page.title") }}</h2>
        <p class="auth_subtitle">{{ $t("auth_pages.login_subtitle") }}</p>

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
        <button class="main-btn">{{ $t("login_page.submit_button") }}</button>
        <button
          type="button"
          class="main-btn google-btn"
          @click="handleGoogleSignIn"
        >
          <i class="pi pi-google"></i>
          <span>{{ $t("auth_pages.google_continue") }}</span>
        </button>

        <p v-if="error" class="auth_error">{{ error }}</p>
        <AuthNav current="login" />
        <GoogleClientSetup />
      </VeeForm>
    </div>
  </div>
</template>

<script setup>
const loginSchema = useLoginSchema();
const { submitMethod } = useApiMethods();
const { loginWithGoogle, error } = useAuth();
const router = useRouter();
const localeRoute = useLocaleRoute();

const handleSubmit = (values) => {
  submitMethod("login", false, values, "POST", "/");
};

const handleGoogleSignIn = async () => {
  const success = await loginWithGoogle();
  if (success) {
    router.push(localeRoute("/"));
  }
};
</script>
