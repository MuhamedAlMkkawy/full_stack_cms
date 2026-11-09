<template>
  <header class="header" v-if="!isAuthRoute($route.path)">
    <div class="container header_content">
      <div class="image">
        <img src="@/assets/images/logo.png" alt="image" loading="lazy" />
      </div>
      <ProjectControl />
    </div>
  </header>
</template>

<script setup>
import { isAuthRoute } from "~/utils/authRoutes";
</script>

<style lang="scss" scoped>
header {
  padding-block: 20px;
  position: absolute;
  width: 100%;
  z-index: 99;
  .header_content {
    @include displayFlex($justify: space-between);
    width: 100%;
    .image {
      max-width: 200px;
    }
  }
}
</style>
