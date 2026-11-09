<template>
  <div class="logo_fields">
    <h4 class="centered">{{ $t("logo.title") }}</h4>

    <!-- Upload Logo -->
    <div class="input upload_logo">
      <input
        type="file"
        accept="image/*"
        id="logo_input"
        hidden
        @change="handleImageUpload"
      />
      <label for="logo_input" class="upload_logo_btn">
        <i class="pi pi-upload"></i>
        <span>{{ $t("logo.upload") }}</span>
      </label>
    </div>

    <!-- Preview -->
    <label for="logo_input" v-if="body.image" class="preview">
      <img :src="body.image" :alt="$t('logo.previewAlt')" loading="lazy" />
      <!-- <button class="pi pi-trash delete_btn" @click="removeImage"></button> -->
    </label>

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

const { t } = useI18n();
const { submitMethod, submitResult, showErrorToast } = useApiMethods();
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

// Image upload
const handleImageUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (!allowedTypes.includes(file.type)) {
    showErrorToast(t("logo.invalidFile"));
    event.target.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  submitMethod("/uploads/single", true, formData, "POST");
};

watchEffect(() => {
  if (submitResult?.value) {
    body.value.image = submitResult.value.data?.path;
  }
});

const removeImage = () => {
  body.value.image = null;
};

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
  .input {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 30px;

    label {
      flex-shrink: 0;
    }

    input {
      border: 0.5px solid #e4e4e4;
      max-width: 150px;
      padding: 8px 10px;
    }
  }

  label.upload_logo_btn {
    border: 1px dashed #e4e4e4;
    border-radius: 6px;
    padding: 12px;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    span {
      margin-left: 8px;
      font-size: 14px;
    }
    &:hover {
      color: #f05d2a;
      border-color: #f05d2a;
    }
  }

  .preview {
    margin-block: 10px;
    position: relative;
    max-width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    display: block;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .delete_btn {
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 13px;
      cursor: pointer;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
    }
  }
}
</style>
