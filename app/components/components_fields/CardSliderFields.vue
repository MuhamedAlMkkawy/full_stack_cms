<template>
  <div class="card_fields">
    <h4 class="centered">{{ $t("cardSlider.title") }}</h4>

    <!-- ITEMS TO SHOW -->
    <div class="input">
      <label for="cardItems">{{ $t("cardSlider.itemsToShow") }}</label>
      <div class="input-wrap">
        <select v-model="slider.itemsToShow">
          <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
        </select>
      </div>
    </div>

    <!-- AUTOPLAY -->
    <div class="input">
      <label>{{ $t("cardSlider.autoplay") }}</label>
      <ToggleButton
        v-model="slider.autoplay"
        class="w-24"
        onLabel="true"
        offLabel="false"
      />
    </div>

    <!-- ADD CARD -->
    <div class="flex_header">
      <h4>{{ $t("cardSlider.cardItems") }}</h4>
      <button class="main-btn mb-4" @click="addNewCard">
        <i class="pi pi-plus"></i>
      </button>
    </div>

    <!-- CARDS -->
    <div class="items_editor">
      <div class="item_card" v-for="(item, index) in slider.items" :key="index">
        <button
          class="pi pi-trash delete_btn"
          v-if="slider.items.length > 1"
          @click="removeItem(index)"
        ></button>

        <!-- IMAGE -->
        <div class="image_wrapper">
          <input
            type="file"
            :id="`card_image_${index}`"
            hidden
            accept="image/*"
            @change="handleCardImageUpload($event, index)"
          />
          <label :for="`card_image_${index}`" class="upload_placeholder">
            <template v-if="!item.file">
              <i class="pi pi-upload"></i>
              <span>{{ $t("cardSlider.uploadImage") }}</span>
            </template>
            <template v-else>
              <img
                :src="item.file"
                loading="lazy"
              />
            </template>
          </label>
        </div>

        <!-- TITLE INPUT -->
        <input
          type="text"
          v-model="item.title"
          :placeholder="$t('cardSlider.placeholders.title')"
          class="card_input"
        />

        <!-- TEXT INPUT -->
        <textarea
          v-model="item.text"
          :placeholder="$t('cardSlider.placeholders.text')"
          class="card_input"
        ></textarea>

        <!-- LINK INPUT -->
        <input
          type="text"
          v-model="item.link"
          :placeholder="$t('cardSlider.placeholders.link')"
          class="card_input"
        />
      </div>
    </div>

    <slot />

    <!-- SUBMIT BUTTON -->
    <button class="main-btn mt-4" @click="handleSubmitCardSlider">
      {{ $t("cardSlider.submit") }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
// -----------------------------
// API & Toast
// -----------------------------
const { submitMethod, submitResult, showErrorToast } = useApiMethods();

// -----------------------------
// EMITS
// -----------------------------
const emit = defineEmits(["handleSubmitFields", "handleCloseComponentPopup"]);

// -----------------------------
// SLIDER STATE
// -----------------------------
const slider = ref({
  itemsToShow: 1,
  autoplay: false,
  items: [{ file: null, title: "", text: "", link: "" }],
});

// -----------------------------
// ADD / REMOVE CARD
// -----------------------------
const addNewCard = () =>
  slider.value.items.push({ file: null, title: "", text: "", link: "" });
const removeItem = (index) => slider.value.items.splice(index, 1);

// -----------------------------
// IMAGE UPLOAD
// -----------------------------
const itemIndex = ref();

const handleCardImageUpload = (event, index) => {
  const file = event.target.files[0];
  if (!file) return showErrorToast(t("cardSlider.errors.noFile"));

  itemIndex.value = slider.value.items[index];

  const formData = new FormData();
  formData.append("file", file);

  submitMethod("/uploads/single", true, formData, "POST", null);
};

watchEffect(() => {
  if (submitResult?.value) itemIndex.value.file = submitResult.value.data.path;
});

// -----------------------------
// HANDLE PROPS VALUES
// -----------------------------
const props = defineProps({ values: Object });

watch(
  () => props.values,
  (values) => {
    slider.value = {
      itemsToShow: values?.content?.itemsToShow ?? 1,
      autoplay: values?.content?.autoplay ?? false,
      items:
        values?.content?.items?.length > 0
          ? values?.content?.items.map((item) => ({
              file: item.file ?? null,
              title: item.title ?? "",
              text: item.text ?? "",
              link: item.link ?? "",
            }))
          : [{ file: null, title: "", text: "", link: "" }],
    };
  },
  { immediate: true },
);

// -----------------------------
// SUBMIT
// -----------------------------
const handleSubmitCardSlider = () => {
  if (!slider.value.items.length) {
    return showErrorToast(t("cardSlider.errors.minCard"));
  }

  const invalidIndex = slider.value.items.findIndex(
    (item) =>
      !item.file 
      // !item.title?.trim() ||
      // !item.text?.trim() ||
      // !item.link?.trim(),
  );

  if (invalidIndex !== -1) {
    return showErrorToast(
      t("cardSlider.errors.fillCard", { index: invalidIndex + 1 }),
    );
  }

  emit("handleSubmitFields", {
    itemsToShow: slider.value.itemsToShow,
    autoplay: slider.value.autoplay,
    items: slider.value.items.map((i) => ({
      file: i.file,
      ...(i.title?.trim() && { title: i.title.trim() }),
      ...(i.text?.trim() && { text: i.text.trim() }),
      ...(i.link?.trim() && { link: i.link.trim() }),
    })),
  });

  emit("handleCloseComponentPopup");
};
</script>

<style lang="scss" scoped>
.card_fields {
  .input {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    select {
      border: 1px solid #e4e4e4;
      border-radius: 4px;
      width: 95px;
      height: 40px;
      cursor: pointer;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .items_editor {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .item_card {
      display: flex;
      flex-direction: column;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 8px;
      width: 300px;
      flex-grow: 1;
      gap: 8px;
      background: #fff;
      position: relative;

      .delete_btn {
        position: absolute;
        top: 2px;
        right: 2px;
        background: $dangerColor;
        color: white;
        border: 1px solid $dangerColor;
        border-radius: 3px;
        font-size: 12px;
        z-index: 9;
        cursor: pointer;
        &:hover {
          background: #fff;
          color: $dangerColor;
        }
      }

      .image_wrapper {
        position: relative;
        width: 100%;
        height: 100px;
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        label.upload_placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 100%;
          height: 100%;
          background: #f9f9f9;
          border: 1px dashed #ddd;
          span {
            font-size: 12px;
            margin-top: 4px;
          }
          i {
            font-size: 20px;
          }
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .card_input {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 6px;
        font-size: 14px;
        width: 100%;
      }
    }
  }
}
</style>
