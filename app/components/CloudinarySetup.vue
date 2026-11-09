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

      <div class="setup_instructions">
        <strong>{{ $t("cloudinary.setupNoteTitle") || "Quick Setup Tip:" }}</strong>
        <span>
          {{
            $t("cloudinary.setupNoteText") ||
            "In your Cloudinary Console (Settings → Upload → Upload presets), make sure your preset's Signing Mode is set to 'Unsigned'."
          }}
        </span>
      </div>

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
        <button
          type="button"
          class="setup_test_btn"
          :disabled="testing"
          @click="testConnection"
        >
          <i v-if="testing" class="pi pi-spin pi-spinner mr-1"></i>
          <i v-else class="pi pi-check-circle mr-1"></i>
          {{ testing ? "Testing..." : "Test Connection" }}
        </button>

        <button type="button" class="setup_save_btn" @click="saveSettings">
          {{ $t("cloudinary.save") }}
        </button>
      </div>

      <div v-if="statusMsg" :class="['setup_status_box', isError ? 'error' : 'success']">
        <i :class="isError ? 'pi pi-exclamation-triangle' : 'pi pi-check'"></i>
        <span>{{ statusMsg }}</span>
      </div>
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
const testing = ref(false);

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
};

const testConnection = async () => {
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

  testing.value = true;
  try {
    const res = await cloudinaryService.testUpload(cloud, preset);
    if (res.success) {
      isError.value = false;
      statusMsg.value = res.message;
      showSuccessToast(res.message);
      // Auto-save verified settings
      cloudinaryService.setCloudName(cloud);
      cloudinaryService.setUploadPreset(preset);
      isConfigured.value = true;
    } else {
      isError.value = true;
      statusMsg.value = res.message;
      showErrorToast(res.message);
    }
  } catch (err) {
    isError.value = true;
    statusMsg.value = err?.message || "Connection test failed";
    showErrorToast(statusMsg.value);
  } finally {
    testing.value = false;
  }
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
    padding: 14px;

    .setup_help {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .setup_instructions {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 11px;
      margin-bottom: 12px;
      line-height: 1.4;

      strong {
        display: block;
        margin-bottom: 2px;
      }
    }

    .setup_fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;

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
      margin-top: 12px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;

      .setup_test_btn {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #e5e7eb;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

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

    .setup_status_box {
      margin-top: 10px;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      display: flex;
      align-items: flex-start;
      gap: 6px;
      line-height: 1.4;

      &.error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
      }

      &.success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #15803d;
      }

      i {
        margin-top: 2px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
