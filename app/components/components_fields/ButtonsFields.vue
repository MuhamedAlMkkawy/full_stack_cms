<template>
  <div class="buttons_fields">
    <h4 class="centered">{{ t("buttons.title") }}</h4>

    <!-- Loop through buttons -->
    <div class="button_item" v-for="(btn, index) in buttons" :key="index">
      <!-- Icon -->
      <div class="input icon_input">
        <label>{{ t("buttons.fields.icon") }}</label>
        <button class="icon_select_btn" @click="emit('openIconPicker', btn)">
          <i :class="btn.icon || 'pi pi-stop'"></i>
        </button>
      </div>

      <!-- Title -->
      <div class="input grow_input">
        <label>{{ t("buttons.fields.title") }}</label>
        <input
          type="text"
          v-model="btn.title"
          :placeholder="t('buttons.placeholders.title')"
        />
      </div>

      <!-- Link -->
      <div class="input">
        <label>{{ t("buttons.fields.link") }}</label>
        <input
          type="text"
          v-model="btn.link"
          :placeholder="t('buttons.placeholders.link')"
        />
      </div>

      <!-- Target -->
      <div class="input">
        <label>{{ t("buttons.fields.target") }}</label>
        <select v-model="btn.target">
          <option value="_self">
            {{ t("buttons.targets.self") }}
          </option>
          <option value="_blank">
            {{ t("buttons.targets.blank") }}
          </option>
        </select>
      </div>

      <!-- Reversed Switch -->
      <div class="input toggle_input">
        <ToggleSwitch v-model="btn.reversed" />
        <span>{{ t("buttons.fields.reversed") }}</span>
      </div>

      <!-- Delete button -->
      <button
        v-if="buttons.length > 1"
        class="delete_btn circled"
        @click="removeButton(index)"
      >
        <i class="pi pi-trash"></i>
      </button>
    </div>

    <slot></slot>

    <div class="flex_buttons">
      <button class="main-btn reversed" @click="addButton">
        {{ t("buttons.actions.addButton") }}
      </button>
      <button class="main-btn" @click="handleSubmitButtons">
        {{ t("buttons.actions.submit") }}
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

const buttons = ref([
  { icon: "", title: "", link: "", target: "_self", reversed: false },
]);

// Add / Remove Buttons
const addButton = () => {
  buttons?.value?.push({
    icon: "",
    title: "",
    link: "",
    target: "_self",
    reversed: false,
  });
};

const removeButton = (index) => {
  if (buttons.value.length > 1) {
    buttons.value.splice(index, 1);
  } else {
    showErrorToast(t("buttons.errors.minButton"));
  }
};

// ----------------------------
// DEFINE PROPS
// ----------------------------
const props = defineProps({
  values: Object, // existing buttons data passed in
});

// -----------------------------
// HANDLE VIEWING THE RENDERED VALUES
// -----------------------------
watch(
  () => props.values,
  (values) => {
    buttons.value =
      values?.content?.items?.length > 0
        ? values?.content?.items.map((btn) => ({
            icon: btn.icon ?? "",
            title: btn.title ?? "",
            link: btn.link ?? "",
            target: btn.target ?? "_self",
            reversed: btn.reversed ?? false,
          }))
        : [
            {
              icon: "",
              title: "",
              link: "",
              target: "_self",
              reversed: false,
            },
          ];
  },
  { immediate: true },
);

// Submit
const handleSubmitButtons = () => {
  // Filter buttons that have at least title and link
  const validButtons = buttons.value
    .filter((b) => b.title?.trim() && b.link?.trim())
    .map((b) => {
      // Only include icon if it has a value
      const buttonData = {
        title: b.title.trim(),
        link: b.link.trim(),
        target: b.target,
        reversed: b.reversed,
      };
      if (b.icon?.trim()) {
        buttonData.icon = b.icon.trim();
      }
      return buttonData;
    });

  if (!validButtons.length) {
    showErrorToast(t("buttons.errors.fillButton"));
    return;
  }
  emit("handleSubmitFields", { items: validButtons });
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.buttons_fields {
  .button_item {
    display: flex;
    align-items: center;
    gap: 10px;
    // border: 1px solid #e4e4e4;
    padding: 10px;
    border-radius: 8px;
    position: relative;
    // &:not(:last-of-type){
    //   margin-bottom: 6px;
    // }
  }
}
</style>
