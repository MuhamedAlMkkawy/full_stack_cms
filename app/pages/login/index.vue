<template>
  <div class="login_page page">
    <div class="container">
      <!-- <div class="image">
        <img src="../../assets/images/logo.png" alt="image" loading="lazy" />
      </div> -->
      <VeeForm
        :validation-schema="loginSchema"
        @submit="handleSubmit"
        class="login_form"
      >
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
      </VeeForm>
      <!-- <LanguageSwitch /> -->
    </div>
  </div>
</template>

<script setup>
// define loginSchema
const loginSchema = useLoginSchema();

// DEFINE API METHODS
const { submitMethod } = useApiMethods();

// DEFINE PAGE META
// definePageMeta({
//   layout: false,
// });

const handleSubmit = (values) => {
  submitMethod("login", false, values, "POST", "/");
};
</script>

<style lang="scss" scoped>
.login_page {
  padding: 0;
  background: linear-gradient(84deg, #007593 3.25%, #044d60 96.85%);
  color: #fff;
  position: relative;
  overflow: hidden;

  .container {
    position: relative;
    z-index: 2;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;

    h1 {
      font-size: 40px;
      font-weight: 700;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }

    .image {
      max-width: 300px;
      margin: 0 auto 20px;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
    }

    .login_form {
      margin-block-start: 50px;
      max-width: 800px;
      width: 100%;
      margin: 50px auto 0;
      background: #fff;
      padding: 20px 20px;
      border-radius: 20px;
      color: $mainColor;
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      transform-style: preserve-3d;
      perspective: 1000px;

      .main-btn {
        max-width: 100%;
        width: 100%;
        margin-block-start: 20px;
        background: linear-gradient(45deg, #007593, #044d60);
        border: none;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 117, 147, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }

      input {
        transition: all 0.15s ease;
        border: 2px solid #e0e0e0;
        padding: 8px !important;

        &:focus {
          border-color: #007593;
          box-shadow: 0 0 0 3px rgba(0, 117, 147, 0.1);
        }

        &:hover {
          border-color: #007593;
        }
      }
    }
  }
}

.languages-switch {
  position: fixed;
  bottom: 40px;
  inset-inline-end: 40px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login_page {
    .container {
      h1 {
        font-size: 32px;
      }

      .image {
        max-width: 250px;
      }

      .login_form {
        margin: 30px 20px 0;
        padding: 20px 15px;
      }
    }
  }
}
</style>
