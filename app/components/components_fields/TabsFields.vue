<template>
  <div class="tabs_fields">
    <h4 class="centered">{{ $t("tabs.title") }}</h4>

    <!-- Tabs Items -->
    <div class="tab_item" v-for="(tab, index) in tabs" :key="index">
      <div class="item_index">
        {{ $t("tabs.tab") }} <span># {{ index + 1 }}</span>
      </div>

      <div class="tab_header">
        <!-- Title -->
        <div class="input grow_input">
          <label>{{ $t("tabs.tabTitle") }}</label>
          <input
            type="text"
            v-model="tab.title"
            :placeholder="$t('tabs.tabTitlePlaceholder')"
          />
        </div>

        <!-- Delete -->
        <button
          v-if="tabs.length > 1"
          class="delete_btn circled"
          @click="removeTab(index)"
        >
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="input full_input">
        <label>{{ $t("tabs.tabDescription") }}</label>
        <textarea
          rows="4"
          v-model="tab.description"
          :placeholder="$t('tabs.tabDescriptionPlaceholder')"
        ></textarea>
      </div>
    </div>

    <slot />

    <!-- Actions -->
    <div class="flex_buttons">
      <button class="main-btn reversed" @click="addTab">
        {{ $t("tabs.addTab") }}
      </button>
      <button class="main-btn" @click="handleSubmitTabs">
        {{ $t("tabs.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { showErrorToast } = useToastMsg();
const emit = defineEmits(["handleSubmitFields", "handleCloseComponentPopup"]);

const tabs = ref([
  {
    title: "",
    description: "",
  },
]);

// ----------------------------
// DEFINE PROPS
// ----------------------------
const props = defineProps({ values: Object });

// -----------------------------
// RENDER DATA FROM PROPS
// -----------------------------
watch(
  () => props.values,
  (values) => {
    if (!values) return;

    tabs.value = values?.content?.items?.map((item) => ({
      title: item.title ?? "",
      description: item.description ?? "",
    })) || [{ title: "", description: "" }];
  },
  { immediate: true }
);

// Add tab
const addTab = () => {
  tabs.value.push({
    title: "",
    description: "",
  });
};

// Remove tab
const removeTab = (index) => {
  if (tabs.value.length > 1) {
    tabs.value.splice(index, 1);
  } else {
    showErrorToast(t("tabs.minError"));
  }
};

// Submit tabs
const handleSubmitTabs = () => {
  const invalid = tabs.value.some(
    (t) => !t?.title?.trim() || !t?.description?.trim()
  );
  if (invalid) {
    showErrorToast(t("tabs.fillAllError"));
    return;
  }
  emit("handleSubmitFields", { items: tabs.value });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.tabs_fields {
  .tab_item {
    margin-bottom: 12px;
    padding: 10px;
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    background: #fff;
    position: relative;

    .tab_header {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .toggle_input {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .item_index {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      span {
        color: $secColor;
      }
    }
  }

  .flex_buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
}
</style>
