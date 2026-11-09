<template>
  <div class="input-wrap">
    <label v-if="props.label" :for="props.name" class="field_label">
      {{ props.label }}
    </label>
    <div class="field_inner">
      <VeeField
        :id="props.name"
        :name="props.name"
        :type="computedType"
        :placeholder="props.placeholder"
        :autofocus="props.autofocus"
        @change="emit('updateInputField', $event.target.value)"
      />
      <button
        v-if="props.type === 'password'"
        type="button"
        class="password_toggle_btn"
        @click="showPassword = !showPassword"
        tabindex="-1"
        :title="showPassword ? 'Hide password' : 'Show password'"
      >
        <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
      </button>
    </div>
    <VeeErrorMessage :name="props.name" />
  </div>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["updateInputField"]);

const showPassword = ref(false);

const computedType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});
</script>

<style lang="scss" scoped>
.input-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 14px;

  .field_label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #374151;
  }

  .field_inner {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    input {
      width: 100%;
      padding: 12px 14px;
      background: #f9fafb;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      color: #1f2937;
      transition: all 0.2s ease;
      max-height: 44px;

      &:focus {
        background: #ffffff;
        border-color: #007593;
        box-shadow: 0 0 0 3px rgba(0, 117, 147, 0.12);
        outline: none;
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .password_toggle_btn {
      position: absolute;
      inset-inline-end: 12px;
      background: transparent;
      border: none;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;

      &:hover {
        color: #111827;
      }
    }
  }

  :deep(span[role="alert"]),
  :deep(.error-message) {
    display: block;
    font-size: 12px;
    color: #dc2626;
    margin-top: 4px;
    font-weight: 500;
  }
}
</style>
