<template>
  <div class="timeline_fields">
    <h4 class="centered">{{ $t("timeline.title") }}</h4>

    <!-- Timeline Items -->
    <div class="timeline_item" v-for="(item, index) in timeline" :key="index">
      <!-- Index -->
      <h6 class="item_index">
        {{ $t("timeline.item") }} <span>#{{ index + 1 }}</span>
      </h6>

      <div class="inputs">
        <!-- Icon -->
        <div class="input icon_input">
          <label>{{ $t("timeline.icon") }}</label>
          <button class="icon_select_btn" @click="emit('openIconPicker', item)">
            <i :class="item.icon || 'pi pi-circle'"></i>
          </button>
        </div>

        <!-- Date -->
        <div class="input">
          <label>{{ $t("timeline.date") }}</label>
          <DatePicker v-model="item.date" />
        </div>

        <!-- Title -->
        <div class="input grow_input">
          <label>{{ $t("timeline.titleField") }}</label>
          <input
            type="text"
            v-model="item.title"
            :placeholder="$t('timeline.titlePlaceholder')"
          />
        </div>
      </div>

      <!-- Delete -->
      <button
        v-if="timeline.length > 1"
        class="delete_btn circled"
        @click="removeItem(index)"
      >
        <i class="pi pi-trash"></i>
      </button>

      <!-- Description -->
      <div class="input full_input">
        <label>{{ $t("timeline.description") }}</label>
        <textarea
          rows="3"
          v-model="item.description"
          :placeholder="$t('timeline.descriptionPlaceholder')"
        ></textarea>
      </div>
    </div>

    <slot />

    <!-- Actions -->
    <div class="flex_buttons">
      <button class="main-btn reversed" @click="addItem">
        {{ $t("timeline.addItem") }}
      </button>
      <button class="main-btn" @click="handleSubmitTimeline">
        {{ $t("timeline.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { showErrorToast } = useToastMsg();
const emit = defineEmits([
  "handleSubmitFields",
  "handleCloseComponentPopup",
  "openIconPicker",
]);

const timeline = ref([
  {
    date: "",
    icon: "",
    title: "",
    description: "",
    classes: "",
  },
]);

// ----------------------------
// DEFINE PROPS FOR EXISTING DATA
// ----------------------------
const props = defineProps({ values: Object });

// -----------------------------
// RENDER DATA FROM PROPS
// -----------------------------
watch(
  () => props.values,
  (values) => {
    if (!values) return;

    timeline.value = values?.content?.items?.map((item) => ({
      date: item.date ? new Date(item.date).toLocaleDateString() : "",
      icon: item.icon ?? "",
      title: item.title ?? "",
      description: item.description ?? "",
      classes: item.classes ?? "",
    })) || [{ date: "", icon: "", title: "", description: "", classes: "" }];
  },
  { immediate: true }
);

// -----------------------------
// ADD / REMOVE ITEMS
// -----------------------------
const addItem = () => {
  timeline.value.push({
    date: "",
    icon: "",
    title: "",
    description: "",
    classes: "",
  });
};

const removeItem = (index) => {
  if (timeline.value.length > 1) {
    timeline.value.splice(index, 1);
  } else {
    showErrorToast(t("timeline.minError"));
  }
};

// -----------------------------
// SUBMIT ITEMS
// -----------------------------
const handleSubmitTimeline = () => {
  const invalid = timeline.value.some(
    (i) => !i.date || !i.title.trim() || !i.description.trim()
  );

  if (invalid) {
    showErrorToast(t("timeline.fillAllError"));
    return;
  }

  const submittedItems = timeline.value.map((i) => {
    const itemData = {
      date: i.date,
      title: i.title.trim(),
      description: i.description.trim(),
      classes: i.classes ?? "",
    };
    if (i.icon?.trim()) itemData.icon = i.icon.trim();
    return itemData;
  });

  emit("handleSubmitFields", { items: submittedItems });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.timeline_fields {
  text-align: start;

  .timeline_item {
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    position: relative;
  }

  input {
    border: none;
  }

  .inputs {
    display: flex;
    gap: 10px;
  }
}
</style>
