<template>
  <div
    class="image_uploader"
    :class="{
      'is_compact': compact,
      'has_image': Boolean(modelValue),
      'is_dragging': isDragging,
      'is_uploading': uploading,
    }"
  >
    <label v-if="label" class="uploader_label">{{ label }}</label>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
      class="hidden_input"
      @change="handleFileChange"
    />

    <!-- 1. PREVIEW STATE (WHEN IMAGE IS PRESENT AND NOT UPLOADING) -->
    <div
      v-if="modelValue && !uploading"
      class="preview_container"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="image_box">
        <img
          :src="modelValue"
          :alt="altText || 'Uploaded image'"
          loading="lazy"
          @error="handleImageError"
        />

        <!-- Drop overlay during drag-over-preview -->
        <div v-if="isDragging" class="drag_overlay">
          <i class="pi pi-cloud-upload"></i>
          <span>{{ $t("imageUploader.dropToReplace") }}</span>
        </div>

        <!-- Action buttons overlay -->
        <div class="action_overlay">
          <button
            type="button"
            class="action_btn replace_btn"
            :title="$t('imageUploader.replace')"
            @click="triggerBrowse"
          >
            <i class="pi pi-pencil"></i>
            <span v-if="!compact">{{ $t("imageUploader.replace") }}</span>
          </button>

          <a
            :href="modelValue"
            target="_blank"
            rel="noopener noreferrer"
            class="action_btn view_btn"
            :title="$t('imageUploader.view')"
          >
            <i class="pi pi-external-link"></i>
          </a>

          <button
            type="button"
            class="action_btn delete_btn"
            :title="$t('imageUploader.delete')"
            @click="handleDelete"
          >
            <i class="pi pi-trash"></i>
            <span v-if="!compact">{{ $t("imageUploader.delete") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. UPLOADING STATE WITH PROGRESS BAR -->
    <div v-else-if="uploading" class="uploading_container">
      <div class="spinner_wrapper">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <div class="progress_info">
        <span class="progress_text">
          {{ $t("imageUploader.uploading") }} {{ uploadProgress }}%
        </span>
        <div class="progress_bar">
          <div
            class="progress_fill"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 3. DROP ZONE / EMPTY STATE -->
    <div
      v-else
      class="drop_zone"
      @click="triggerBrowse"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="drop_content">
        <div class="icon_wrapper">
          <i class="pi pi-cloud-upload"></i>
        </div>
        <div class="text_wrapper">
          <p class="primary_text">
            <span>{{ $t("imageUploader.dragAndDrop") }}</span>
            <span class="browse_highlight">{{ $t("imageUploader.orBrowse") }}</span>
          </p>
          <p class="secondary_text">
            {{ $t("imageUploader.supportedFormats") }} (Max {{ maxSizeMb }}MB)
          </p>
        </div>
      </div>
    </div>

    <!-- Error message display -->
    <div v-if="localError" class="uploader_error">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ localError }}</span>
      <button type="button" class="dismiss_error" @click="localError = ''">
        <i class="pi pi-times"></i>
      </button>
    </div>

    <!-- Cloudinary configuration shortcut if unconfigured -->
    <CloudinarySetup v-if="!isCloudinaryReady" />
  </div>
</template>

<script setup>
import { cloudinaryService } from "@/services/cloudinary/cloudinaryService";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  projectId: {
    type: String,
    default: "",
  },
  organizationId: {
    type: String,
    default: "",
  },
  maxSizeMb: {
    type: Number,
    default: 5,
  },
  altText: {
    type: String,
    default: "",
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "uploaded", "deleted", "error"]);

const { t } = useI18n();
const { showErrorToast, showSuccessToast } = useToastMsg();
const { uploadAsset, deleteAsset, uploading, uploadProgress } = useAssets();

const fileInputRef = ref(null);
const isDragging = ref(false);
const dragCounter = ref(0);
const localError = ref("");
const isCloudinaryReady = ref(true);

const checkCloudinaryConfig = () => {
  isCloudinaryReady.value = cloudinaryService.isConfigured();
};

const triggerBrowse = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
    fileInputRef.value.click();
  }
};

const onDragEnter = () => {
  dragCounter.value++;
  isDragging.value = true;
};

const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  dragCounter.value--;
  if (dragCounter.value <= 0) {
    dragCounter.value = 0;
    isDragging.value = false;
  }
};

const onDrop = (event) => {
  dragCounter.value = 0;
  isDragging.value = false;

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  processUpload(file);
};

const handleFileChange = (event) => {
  const files = event.target?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  processUpload(file);
};

const processUpload = async (file) => {
  localError.value = "";

  // 1. Validate file
  const validation = cloudinaryService.validateImage(file, props.maxSizeMb);
  if (!validation.valid) {
    localError.value = validation.error || t("logo.invalidFile");
    showErrorToast(localError.value);
    emit("error", new Error(localError.value));
    return;
  }

  // 2. Check Cloudinary configuration
  if (!cloudinaryService.isConfigured()) {
    isCloudinaryReady.value = false;
    localError.value = t("cloudinary.configurePrompt");
    showErrorToast(localError.value);
    emit("error", new Error(localError.value));
    return;
  }

  // 3. Upload to Cloudinary with progress
  try {
    const asset = await uploadAsset(
      file,
      {
        organization_id: props.organizationId,
        project_id: props.projectId,
        filename: file.name,
      }
    );

    emit("update:modelValue", asset.url);
    emit("uploaded", asset);
    showSuccessToast(t("imageUploader.uploadSuccess"));
  } catch (err) {
    localError.value = err?.message || t("imageUploader.uploadFailed");
    showErrorToast(localError.value);
    emit("error", err);
  }
};

const handleDelete = async () => {
  const currentUrl = props.modelValue;
  if (!currentUrl) return;

  try {
    await deleteAsset(currentUrl);
  } catch (err) {
    console.warn("[ImageUploader] Error deleting asset record:", err);
  }

  emit("update:modelValue", "");
  emit("deleted", currentUrl);
  showSuccessToast(t("imageUploader.deleteSuccess"));
};

const handleImageError = () => {
  localError.value = t("imageUploader.imageLoadError");
};

onMounted(() => {
  checkCloudinaryConfig();
});
</script>

<style lang="scss" scoped>
.image_uploader {
  position: relative;
  width: 100%;
  margin-block: 10px;

  .uploader_label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }

  .hidden_input {
    display: none;
  }

  /* DROP ZONE / EMPTY STATE */
  .drop_zone {
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    padding: 24px 16px;
    background: #f9fafb;
    cursor: pointer;
    text-align: center;
    transition: all 0.25s ease;

    &:hover {
      border-color: #007593;
      background: #f0fdfa;

      .icon_wrapper i {
        color: #007593;
        transform: translateY(-2px);
      }
    }

    .drop_content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      .icon_wrapper {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #e0f2fe;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 22px;
          color: #0284c7;
          transition: transform 0.2s;
        }
      }

      .text_wrapper {
        .primary_text {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;

          .browse_highlight {
            color: #007593;
            text-decoration: underline;
            margin-inline-start: 4px;
          }
        }

        .secondary_text {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }

  /* DRAGGING ACTIVE STATE */
  &.is_dragging .drop_zone {
    border-color: #007593;
    background: #e0f2fe;
    transform: scale(1.01);
  }

  /* PREVIEW CONTAINER */
  .preview_container {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .image_box {
      position: relative;
      width: 100%;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .drag_overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 117, 147, 0.85);
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
        z-index: 5;

        i {
          font-size: 28px;
        }
      }

      .action_overlay {
        position: absolute;
        bottom: 8px;
        inset-inline: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: rgba(17, 24, 39, 0.75);
        backdrop-filter: blur(4px);
        padding: 6px 12px;
        border-radius: 8px;
        transition: opacity 0.2s;

        .action_btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.15);
          text-decoration: none;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }

          &.replace_btn {
            background: #007593;
            &:hover {
              background: #044d60;
            }
          }

          &.delete_btn {
            background: #dc2626;
            &:hover {
              background: #b91c1c;
            }
          }
        }
      }
    }
  }

  /* UPLOADING STATE */
  .uploading_container {
    border: 2px solid #007593;
    border-radius: 12px;
    padding: 24px 16px;
    background: #f0fdfa;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .spinner_wrapper {
      i {
        font-size: 26px;
        color: #007593;
      }
    }

    .progress_info {
      width: 100%;
      max-width: 240px;
      text-align: center;

      .progress_text {
        font-size: 13px;
        font-weight: 600;
        color: #007593;
        display: block;
        margin-bottom: 6px;
      }

      .progress_bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;

        .progress_fill {
          height: 100%;
          background: linear-gradient(90deg, #007593, #044d60);
          transition: width 0.2s ease;
        }
      }
    }
  }

  /* COMPACT MODE FOR CARD SLIDER */
  &.is_compact {
    margin-block: 4px;

    .drop_zone {
      padding: 12px 8px;

      .icon_wrapper {
        width: 32px;
        height: 32px;
        i {
          font-size: 16px;
        }
      }

      .primary_text {
        font-size: 12px;
      }

      .secondary_text {
        font-size: 10px;
      }
    }

    .preview_container .image_box {
      height: 110px;

      .action_overlay {
        padding: 4px;
        gap: 4px;

        .action_btn {
          padding: 4px 6px;
          font-size: 11px;
        }
      }
    }
  }

  /* ERROR NOTIFICATION */
  .uploader_error {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;

    i {
      font-size: 14px;
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }

    .dismiss_error {
      background: transparent;
      border: none;
      color: #b91c1c;
      cursor: pointer;
      font-size: 12px;
      padding: 2px;
    }
  }
}
</style>

