<template>
  <div class="project_control">
    <button
      v-if="projectId"
      class="publish_btn main-btn"
      :disabled="publishing"
      @click="handlePublish"
      title="Publish Site"
    >
      <i class="pi pi-cloud-upload"></i>
      <span>{{ publishing ? 'Publishing...' : 'Publish' }}</span>
    </button>
    <a
      v-if="projectId"
      :href="`/sites/${projectId}`"
      target="_blank"
      class="view_live_btn main-btn"
      title="View Published Site"
    >
      <i class="pi pi-external-link"></i>
      <span>Live</span>
    </a>
    <button
      class="logout_btn main-btn danger"
      :title="$t('logout.text')"
      @click="handleLogout"
      v-if="!isAuthRoute($route.path)"
    >
      <i class="pi pi-sign-out"></i>
    </button>
    <LanguageSwitch />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { isAuthRoute } from '~/utils/authRoutes';
import { usePublishing } from '@/composables/usePublishing';
import { useToastMsg } from '@/composables/useToastMsg';

const { submitMethod } = useApiMethods();
const route = useRoute();
const projectId = computed(() => route.params.id);
const { publishProject, publishing } = usePublishing();
const { showSuccessToast, showErrorToast } = useToastMsg();

const handlePublish = async () => {
  if (!projectId.value) return;
  try {
    await publishProject(projectId.value);
    showSuccessToast('Website published successfully!');
  } catch (err) {
    showErrorToast(err?.message || 'Publishing failed');
  }
};

// ----------------------------
// HANDLE LOGOUT
// ----------------------------
const handleLogout = () => {
  submitMethod("/logout", true, null, "POST", "/login");
};
</script>

<style lang="scss" scoped>
.project_control {
  display: flex;
  align-items: center;
  gap: 10px;
}

button.publish_btn {
  width: unset;
  height: 45px;
  padding: 0px 18px;
  margin: 0 !important;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  background: linear-gradient(45deg, #007593, #044d60);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

a.view_live_btn {
  height: 45px;
  padding: 0px 14px;
  margin: 0 !important;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  background: #ffffff;
  color: #044d60;
  border: 1px solid #044d60;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: 0.3s;
  &:hover {
    background: #f0fdfa;
    transform: translateY(-1px);
  }
}

button.logout_btn {
  width: unset;
  height: 45px;
  padding: 0px 15px;
  margin: 0 !important;
  display: flex;
  gap: 5px;
  border-radius: 4px;
  background-color: #fee9e9;
  border-color: #fee9e9;
  span {
    font-size: 16px;
  }
  i.pi {
    color: $dangerColor !important;
  }
}
</style>
