<template>
  <div class="google_client_setup">
    <button
      type="button"
      class="setup_toggle"
      @click="expanded = !expanded"
    >
      {{
        hasValidClientId
          ? $t("auth_pages.google_client.configured")
          : $t("auth_pages.google_client.missing")
      }}
    </button>

    <div v-if="expanded || !hasValidClientId" class="setup_body">
      <p>{{ $t("auth_pages.google_client.help") }}</p>
      <input
        v-model="clientIdInput"
        type="text"
        :placeholder="$t('auth_pages.google_client.placeholder')"
        autocomplete="off"
      />
      <button type="button" class="main-btn setup_save" @click="saveClientId">
        {{ $t("auth_pages.google_client.save") }}
      </button>
      <p v-if="setupError" class="auth_error">{{ setupError }}</p>
      <p v-if="setupSuccess" class="setup_success">{{ setupSuccess }}</p>
    </div>
  </div>
</template>

<script setup>
import { googleSheetsAuth } from "@/services/google-sheets/googleSheetsAuth";

const { t } = useI18n();
const { showSuccessToast, showErrorToast } = useToastMsg();

const expanded = ref(false);
const clientIdInput = ref("");
const setupError = ref("");
const setupSuccess = ref("");
const hasValidClientId = ref(false);

const refreshStatus = () => {
  const current = googleSheetsAuth.getClientId();
  hasValidClientId.value = googleSheetsAuth.isValidClientId(current);
  if (current && !clientIdInput.value) {
    clientIdInput.value = current;
  }
};

const saveClientId = async () => {
  setupError.value = "";
  setupSuccess.value = "";
  const value = clientIdInput.value.trim();
  if (!googleSheetsAuth.isValidClientId(value)) {
    setupError.value = t("auth_pages.google_client.invalid");
    showErrorToast(setupError.value);
    return;
  }

  googleSheetsAuth.setClientId(value);
  try {
    await googleSheetsAuth.initTokenClient(value);
    hasValidClientId.value = true;
    setupSuccess.value = t("auth_pages.google_client.saved");
    showSuccessToast(setupSuccess.value);
  } catch (err) {
    setupError.value = err?.message || t("auth_pages.google_client.invalid");
    showErrorToast(setupError.value);
  }
};

onMounted(() => {
  refreshStatus();
});
</script>

<style lang="scss" scoped>
.google_client_setup {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;

  .setup_toggle {
    width: 100%;
    background: transparent;
    border: none;
    color: #044d60;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
  }

  .setup_body {
    margin-top: 12px;

    p {
      font-size: 13px;
      color: #4b5563;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    input {
      width: 100%;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
      color: #111827;
    }
  }

  .setup_save {
    height: 44px;
    margin-block-start: 10px;
    font-size: 14px;
  }

  .setup_success {
    margin-top: 8px;
    color: #047857;
    font-size: 13px;
    text-align: center;
  }
}
</style>
