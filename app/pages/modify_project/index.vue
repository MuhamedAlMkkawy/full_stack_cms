<template>
  <div class="page modify_project_page">
    <div class="container modify_project_content">
      <VeeForm
        :validation-schema="modifyProjectSchema"
        class="form"
        @submit="handleSubmit"
      >
        <div class="project_logo_field">
          <label class="field_label">
            {{ t("project.uploadLogo") }}
          </label>
          <ImageUploader
            v-model="image"
            :max-size-mb="5"
          />
        </div>

        <div class="inputs">
          <CustomField
            name="ar_name"
            type="text"
            :placeholder="t('project.fields.arName')"
          />
          <CustomField
            name="en_name"
            type="text"
            :placeholder="t('project.fields.enName')"
          />
        </div>

        <div class="inputs">
          <CustomTextarea
            name="ar_description"
            :placeholder="t('project.fields.arDescription')"
            :rows="10"
          />
          <CustomTextarea
            name="en_description"
            :placeholder="t('project.fields.enDescription')"
            :rows="10"
          />
        </div>

        <button class="main-btn">
          {{ t("project.submit") }}
        </button>
      </VeeForm>
    </div>
    <LanguageSwitch />
  </div>
</template>

<script setup>
import { modifyProjectSchema } from "../../schemas/modifyProject";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const { submitMethod, submitResult, showErrorToast } = useApiMethods();

definePageMeta({
  layout: "none",
});

const image = ref("");

const handleSubmit = (values) => {
  if (!image.value) {
    showErrorToast(t("project.errors.logoRequired"));
    return;
  }

    const formData = new FormData();
    formData.append("logo", image.value);
    formData.append("name.ar", values.ar_name);
    formData.append("name.en", values.en_name);
    formData.append("description.ar", values.ar_description);
    formData.append("description.en", values.en_description);

  submitMethod("/projects", true, formData, "POST", "/projects");
};
</script>

<style lang="scss" scoped>
.modify_project_page {
  .modify_project_content {
    min-height: 80vh;
    @include displayFlex();
    .form {
      max-width: 992px;
      width: 100%;
      .upload_image_icon {
        @include displayFlex();
        margin: 0 auto 20px;
        @include circle(150px);
        border: 1px solid #fff;
        cursor: pointer;
        z-index: 3;
        transition: 0.3s;
        i {
          // color: $mainColor;
          font-size: 30px;
        }
        img {
          transition: 0.3s;
          object-fit: contain;
          &:hover {
            filter: brightness(0.7);
          }
        }
        &:hover {
          background: $mainColor;
          i {
            color: #fff;
          }
        }
        + label {
          display: block;
          margin-bottom: 50px;
          // color: $mainColor;
          text-align: center;
        }
      }

      .project_logo_field {
        max-width: 360px;
        margin: 0 auto 24px;
        text-align: center;

        .field_label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
          color: #fff;
        }
      }

      .inputs {
        width: 100%;
      }
    }
  }
}
</style>
