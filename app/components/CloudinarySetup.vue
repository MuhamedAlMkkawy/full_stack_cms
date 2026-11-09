<template>
  <div class="cloudinary_setup">
    <button
      type="button"
      class="setup_toggle"
      @click="expanded = !expanded"
    >
      <i class="pi pi-cloud mr-1"></i>
      {{
        isConfigured
          ? $t("cloudinary.configured")
          : $t("cloudinary.configure")
      }}
    </button>

    <div v-if="expanded" class="setup_body">
      <p class="setup_help">{{ $t("cloudinary.help") }}</p>

      <div class="setup_fields">
        <div class="field_group">
          <label>{{ $t("cloudinary.cloudNameLabel") }}</label>
          <input
            v-model="cloudNameInput"
            type="text"
            :placeholder="$t('cloudinary.cloudNamePlaceholder')"
            autocomplete="off"
          />
        </div>

        <div class="field_group">
          <label>{{ $t("cloudinary.presetLabel") }}</label>
          <input
            v-model="presetInput"
            type="text"
            :placeholder="$t('cloudinary.presetPlaceholder')"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="setup_actions">
        <button type="button" class="setup_save_btn" @click="saveSettings">
          {{ $t("cloudinary.save") }}
        </button>
      </div>

      <p v-if="statusMsg" :class="isError ? 'setup_error' : 'setup_success'">
        {{ statusMsg }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { cloudinaryService } from "@/services/cloudinary/cloudinaryService";

const { t } = useI18n();
const { showSuccessToast, showErrorToast } = useToastMsg();

const expanded = ref(false);
const cloudNameInput = ref("");
const presetInput = ref("");
const statusMsg = ref("");
const isError = ref(false);
const isConfigured = ref(false);

const refresh = () => {
  cloudNameInput.value = cloudinaryService.getCloudName();
  presetInput.value = cloudinaryService.getUploadPreset();
  isConfigured.value = cloudinaryService.isConfigured();
};

const saveSettings = () => {
  statusMsg.value = "";
  isError.value = false;

  const cloud = cloudNameInput.value.trim();
  const preset = presetInput.value.trim();

  if (!cloud || !preset) {
    isError.value = true;
    statusMsg.value = t("cloudinary.missingFields");
    showErrorToast(statusMsg.value);
    return;
  }

  cloudinaryService.setCloudName(cloud);
  cloudinaryService.setUploadPreset(preset);
  isConfigured.value = true;

  statusMsg.value = t("cloudinary.saved");
  showSuccessToast(statusMsg.value);
  setTimeout(() => {
    expanded.value = false;
  }, 1200);
};

onMounted(() => {
  refresh();
});
</script>

<style lang="scss" scoped>
.cloudinary_setup {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;

  .setup_toggle {
    background: transparent;
    border: none;
    color: #4b5563;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 6px;
    transition: color 0.2s;

    &:hover {
      color: #007593;
    }
  }

  .setup_body {
    margin-top: 10px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;

    .setup_help {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .setup_fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }

      .field_group {
        label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        input {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 12px;
          background: #ffffff;

          &:focus {
            border-color: #007593;
            outline: none;
          }
        }
      }
    }

    .setup_actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;

      .setup_save_btn {
        background: #007593;
        color: #ffffff;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #044d60;
        }
      }
    }

    .setup_error {
      color: #dc2626;
      font-size: 11px;
      margin-top: 6px;
      text-align: center;
    }

    .setup_success {
      color: #059669;
      font-size: 11px;
      margin-top: 6px;
      text-align: center;
    }
  }
}
</style>

