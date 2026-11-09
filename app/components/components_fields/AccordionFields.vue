<template>
  <div class="accordion_fields">
    <h4 class="centered">{{ $t("accordion.title") }}</h4>

    <!-- Accordion Items -->
    <div
      class="accordion_item"
      v-for="(item, index) in accordions"
      :key="index"
    >
      <h6 class="item_index">
        {{ $t("accordion.item") }} <span>#{{ index + 1 }}</span>
      </h6>

      <!-- Title -->
      <div class="input grow_input">
        <label>{{ $t("accordion.fields.titleLabel") }}</label>
        <input
          type="text"
          v-model="item.title"
          :placeholder="$t('accordion.fields.titlePlaceholder')"
        />
      </div>

      <!-- Delete -->
      <button
        v-if="accordions.length > 1"
        class="delete_btn circled"
        @click="removeAccordion(index)"
      >
        <i class="pi pi-trash"></i>
      </button>

      <!-- Content -->
      <div class="input full_input">
        <label>{{ $t("accordion.fields.contentLabel") }}</label>
        <textarea
          rows="4"
          v-model="item.content"
          :placeholder="$t('accordion.fields.contentPlaceholder')"
        ></textarea>
      </div>
    </div>

    <slot />

    <!-- Actions -->
    <div class="flex_buttons">
      <button class="main-btn reversed" @click="addAccordion">
        {{ $t("accordion.actions.addItem") }}
      </button>
      <button class="main-btn" @click="handleSubmitAccordion">
        {{ $t("accordion.actions.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { showErrorToast } = useToastMsg();

const emit = defineEmits(["handleSubmitFields", "handleCloseComponentPopup"]);

const accordions = ref([{ title: "", content: "" }]);

// Props with default to avoid undefined
const props = defineProps({
  values: {
    type: Object,
    default: () => ({ items: [] }),
  },
});

// Initialize from props or fallback to one default item
watch(
  () => props.values,
  (values) => {
    accordions.value =
      values?.content?.items?.length > 0
        ? values?.content?.items.map((item) => ({
            title: item.title ?? "",
            content: item.content ?? "",
          }))
        : [{ title: "", content: "" }];
  },
  { immediate: true },
);

// Add accordion
const addAccordion = () => {
  accordions.value.push({ title: "", content: "" });
};

// Remove accordion
const removeAccordion = (index) => {
  if (accordions.value.length > 1) {
    accordions.value.splice(index, 1);
  } else {
    showErrorToast(t("accordion.errors.atLeastOne"));
  }
};

// Submit
const handleSubmitAccordion = () => {
  const invalid = accordions.value.some(
    (a) => !a.title.trim() || !a.content.trim(),
  );

  if (invalid) {
    showErrorToast(t("accordion.errors.fillAll"));
    return;
  }

  emit("handleSubmitFields", { items: accordions.value });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.accordion_fields {
  .accordion_item {
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    position: relative;
    text-align: start;
  }

  .accordion_index {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 6px;
  }

  textarea {
    resize: vertical;
    min-height: 90px;
  }
}
</style>
