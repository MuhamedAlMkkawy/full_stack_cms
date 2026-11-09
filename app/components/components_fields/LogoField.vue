<template>
  <div class="logo_fields">
    <h4 class="centered">{{ $t("logo.title") }}</h4>

    <!-- Image Uploader with Drag & Drop, Preview, Replace, Delete, and Progress -->
    <div class="logo_uploader_wrapper">
      <ImageUploader
        v-model="body.image"
        :project-id="route.params.id"
        :label="$t('logo.upload')"
        :max-size-mb="5"
        @deleted="body.image = null"
      />
    </div>

    <!-- Width -->
    <div class="input">
      <label for="logo_width">{{ $t("logo.widthLabel") }}</label>
      <input
        id="logo_width"
        type="number"
        v-model="body.width"
        class="input-wrap"
        :placeholder="$t('logo.widthPlaceholder')"
      />
    </div>

    <!-- Height -->
    <div class="input">
      <label for="logo_height">{{ $t("logo.heightLabel") }}</label>
      <input
        id="logo_height"
        type="number"
        v-model="body.height"
        class="input-wrap"
        :placeholder="$t('logo.heightPlaceholder')"
      />
    </div>

    <slot></slot>

    <button class="main-btn" @click="handleSubmitLogo">
      {{ $t("logo.submit") }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const { showErrorToast } = useToastMsg();
const emit = defineEmits(["handleSubmitFields", "handleCloseComponentPopup"]);

const body = ref({
  image: null,
  width: "",
  height: "",
});

const props = defineProps({
  values: { type: Object, default: () => ({}) },
});

// Initialize from props
watch(
  () => props.values,
  (values) => {
    body.value = {
      image: values?.content?.image ?? null,
      width: values?.content?.width ?? "",
      height: values?.content?.height ?? "",
    };
  },
  { immediate: true },
);

// Submit
const handleSubmitLogo = () => {
  if (!body.value.image) {
    showErrorToast(t("logo.imageRequired"));
    return;
  }

  emit("handleSubmitFields", { ...body.value });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.logo_fields {
  .logo_uploader_wrapper {
    margin-bottom: 16px;
  }

  .input {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
    margin-bottom: 12px;

    label {
      flex-shrink: 0;
      font-size: 13px;
      font-weight: 500;
    }

    input {
      border: 1px solid #e4e4e4;
      border-radius: 6px;
      max-width: 150px;
      padding: 8px 10px;

      &:focus {
        border-color: #007593;
        outline: none;
      }
    }
  }

  .main-btn {
    width: 100%;
    margin-top: 16px;
  }
}
</style>
