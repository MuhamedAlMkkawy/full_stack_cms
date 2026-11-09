<template>
  <div class="project_control">
    <button
      class="logout_btn main-btn danger"
      :title="$t('logout.text')"
      @click="handleLogout"
      v-if="!$route.path.endsWith('/login')"
    >
      <i class="pi pi-sign-out"></i>
      <!-- <span>{{ $t("logout.text") }}</span> -->
    </button>
    {{ token }}
    <LanguageSwitch />
  </div>
</template>

<script setup>
const { submitMethod } = useApiMethods();

const token = useState("token");
// ----------------------------
// HANDLE LOGOUT
// ----------------------------
const handleLogout = () => {
  submitMethod("/logout", true, null, "POST", "/login");
};
</script>

<style lang="scss" scoped>
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
