<template>
  <div class="page modify_project_page">
    <div class="container modify_project_content">
      <VeeForm
        :validation-schema="modifyProjectSchema"
        class="form"
        @submit="handleSubmit"
      >
        <label for="upload_img" class="upload_image_icon image">
          <img
            v-if="image"
            :src="image"
            alt="project image"
            loading="lazy"
          />
          <i v-else class="pi pi-upload"></i>
        </label>
        <!-- {{ image }} -->

        <label for="upload_img">
          {{ t("project.uploadLogo") }}
        </label>

        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload($event.target.files[0])"
          id="upload_img"
          hidden
        />

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

const image = ref();

const handleImageUpload = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  if (!allowedTypes.includes(file.type)) {
    showErrorToast(t("logo.invalidFile"));
    e.target.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  submitMethod("/uploads/single", true , formData, "POST", null);
};

watchEffect(() => {
  if (submitResult?.value) {
    image.value = submitResult?.value?.data?.path;
  }
});

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

      .inputs {
        width: 100%;
      }
    }
  }
}
</style>
