<template>
  <div class="auth_page page">
    <!-- Top Bar Language Switcher -->
    <div class="auth_top_bar">
      <LanguageSwitch />
    </div>

    <div class="auth_container wide">
      <!-- Brand Header -->
      <div class="auth_brand">
        <img
          src="@/assets/images/logo.png"
          alt="CMS Logo"
          class="brand_logo"
          loading="lazy"
        />
        <h1>CMS Builder</h1>
      </div>

      <!-- Auth Card -->
      <div class="auth_card">
        <!-- Tab Navigation -->
        <AuthNav current="register" />

        <div class="auth_header">
          <h2>{{ $t("auth_pages.register_title") }}</h2>
          <p class="auth_subtitle">{{ $t("auth_pages.register_subtitle") }}</p>
        </div>

        <VeeForm
          :validation-schema="registerSchema"
          @submit="handleSubmit"
          class="auth_form_body"
          v-slot="{ isSubmitting }"
        >
          <!-- User Details -->
          <div class="inputs_grid">
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
          </div>

          <!-- Company Details Section -->
          <div class="auth_section_title">
            {{ $t("auth_pages.company_section") }}
          </div>

          <div class="inputs_grid">
            <CustomField
              name="companyName"
              type="text"
              :label="$t('auth_pages.companyName')"
              :placeholder="$t('auth_pages.companyNamePlaceholder')"
            />
            <CustomField
              name="companySlug"
              type="text"
              :label="$t('auth_pages.companySlug')"
              :placeholder="$t('auth_pages.companySlugPlaceholder')"
            />
          </div>

          <!-- Password Section -->
          <div class="inputs_grid">
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
          </div>

          <button
            type="submit"
            class="auth_submit_btn"
            :disabled="isSubmitting || authLoading"
          >
            <i
              v-if="isSubmitting || authLoading"
              class="pi pi-spin pi-spinner"
            ></i>
            <span>{{ $t("auth_pages.register_submit") }}</span>
          </button>

          <div class="auth_divider">
            <span>{{ $t("auth_pages.or") }}</span>
          </div>

          <button
            type="button"
            class="google-btn"
            :disabled="isSubmitting || authLoading"
            @click="handleGoogleSignIn"
          >
            <svg
              class="google_icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{{ $t("auth_pages.google_continue") }}</span>
          </button>

          <!-- Error Alert -->
          <div v-if="error" class="auth_alert error">
            <i class="pi pi-exclamation-circle"></i>
            <span>{{ error }}</span>
          </div>

          <!-- Bottom link -->
          <div class="auth_footer_prompt">
            <span>{{ $t("auth_pages.have_account") }}</span>
            <NuxtLink :to="$localeRoute('/login')">
              {{ $t("auth_pages.login_link") }}
            </NuxtLink>
          </div>

          <GoogleClientSetup />
        </VeeForm>
      </div>
    </div>
  </div>
</template>

<script setup>
const registerSchema = useRegisterSchema();
const { registerWithCredentials, loginWithGoogle, loading: authLoading, error } = useAuth();
const router = useRouter();
const localeRoute = useLocaleRoute();

const handleSubmit = async (values) => {
  const success = await registerWithCredentials(
    values.name,
    values.email,
    values.password,
    {
      companyName: values.companyName,
      companySlug: values.companySlug,
    }
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
