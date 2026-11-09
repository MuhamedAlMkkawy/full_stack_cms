<template>
  <div class="custom_html_fields">
    <h4 class="centered">{{ $t("customHtml.title") }}</h4>

    <!-- HTML QUILL EDITOR -->
    <Editor v-model="body.html" :placeholder="$t('customHtml.placeholder')" />

    <slot></slot>

    <button class="main-btn" @click="handleSubmitHtml">
      {{ $t("customHtml.submit") }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { showErrorToast } = useToastMsg();

// Define emits
const emit = defineEmits(["handleSubmitFields", "handleCloseComponentPopup"]);

// Editor state
const body = ref({
  html: "",
});

// Props
const props = defineProps({
  values: {
    type: Object,
    default: () => ({ html: "" }), // default to empty html
  },
});

// Initialize from props
watch(
  () => props.values,
  (values) => {
    body.value.html = values?.content?.html ?? "";
  },
  { immediate: true },
);

// Submit
const handleSubmitHtml = () => {
  if (!body.value.html?.trim()) {
    showErrorToast(t("customHtml.emptyError"));
    return;
  }

  emit("handleSubmitFields", { html: body.value.html });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.custom_html_fields {
  max-height: 700px;
  overflow-y: auto;
  padding: 8px;

  .input {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
    }
  }

  // Styling for Quill Editor if using PrimeVue Editor
  :deep(.p-editor-container) {
    width: 100%;
    min-height: 200px;
    border-radius: 6px;
    border: 1px solid #e4e4e4;

    &:focus-within {
      border-color: #f05d2a; // main color
    }
  }
}
</style>
