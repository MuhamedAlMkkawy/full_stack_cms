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
        </VeeForm>
      </div>
    </div>
  </div>
</template>

<script setup>
const registerSchema = useRegisterSchema();
const { registerWithCredentials, loading: authLoading, error } = useAuth();
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
</script>
