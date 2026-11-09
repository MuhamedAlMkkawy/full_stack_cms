<template>
  <div class="popup">
    <div class="content">
      <button class="pi pi-times close_btn" @click="handleClose"></button>

      <h4>{{ $t("sectionPopup.title") }}</h4>

      <div class="input">
        <input
          type="text"
          v-model.trim="section.name"
          :placeholder="$t('sectionPopup.placeholder')"
          @keydown.enter="handleSubmit"
        />
      </div>

      <button class="main-btn" @click="handleSubmit">
        {{ $t("sectionPopup.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { showErrorToast } = useApiMethods();

/* ------------------------
 * EMITS
 * ------------------------ */
const emit = defineEmits([
  "handleSectionPopup",
  "handleShowControlSectionPopup",
]);

/* ------------------------
 * PROPS (edit mode optional)
 * ------------------------ */
const props = defineProps({
  modifiedSection: {
    type: Object,
    default: null,
  },
});

/* ------------------------
 * STATE
 * ------------------------ */
const section = ref({
  name: "",
  visible: true,
  layout_items: 1,
  components: [],
  isDragOver: false,
});

/* ------------------------
 * WATCH EDIT MODE
 * ------------------------ */
watch(
  () => props.modifiedSection,
  (val) => {
    if (!val) return;

    section.value = {
      name: val.name ?? "",
      visible: val.visible ?? true,
      layout_items: val.layout_items ?? 1,
      components: val.components ?? [],
      isDragOver: false,
    };
  },
  { immediate: true },
);

/* ------------------------
 * HELPER: Convert spaces to dash
 * ------------------------ */
const slugify = (str) => str.trim().replace(/\s+/g, "-");

/* ------------------------
 * METHODS
 * ------------------------ */
const handleSubmit = () => {
  if (!section.value.name.trim()) {
    showErrorToast(t("sectionPopup.emptyError"));
    return;
  }

  // Convert spaces to dash before emitting
  const slugifiedName = slugify(section.value.name);

  emit("handleSectionPopup", {
    ...section.value,
    name: slugifiedName,
  });

  handleClose();
};

const handleClose = () => {
  section.value = {
    name: "",
    visible: true,
    layout_items: 1,
    components: [],
    isDragOver: false,
  };

  emit("handleShowControlSectionPopup");
};
</script>
