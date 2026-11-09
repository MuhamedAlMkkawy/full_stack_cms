<template>
  <div class="page home_page gradient_background">
    <div class="container">
      <!-- <div class="image mazaya_logo">
        <img
          src="../assets/images/logo.png"
          :alt="$t('home.logoAlt')"
          loading="lazy"
        />
      </div> -->

      <h1>{{ $t("home.welcome") }}</h1>

      <div class="stat_items content_items items_4">
        <NuxtLink
          :to="$localeRoute('/projects')"
          class="stat_item content_item"
        >
          <h3>{{ getResult?.data?.projects }}</h3>
          <h4>{{ $t("home.stats.projects") }}</h4>
        </NuxtLink>

        <NuxtLink class="stat_item content_item">
          <h3>{{ getResult?.data?.pages }}</h3>
          <h4>{{ $t("home.stats.pages") }}</h4>
        </NuxtLink>

        <NuxtLink class="stat_item content_item">
          <h3>{{ getResult?.data?.sections }}</h3>
          <h4>{{ $t("home.stats.sections") }}</h4>
        </NuxtLink>

        <NuxtLink class="stat_item content_item">
          <h3>{{ getResult?.data?.components }}</h3>
          <h4>{{ $t("home.stats.components") }}</h4>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getMethod, getResult } = useApiMethods();

// definePageMeta({
//   layout: "none",
// });

onMounted(() => {
  getMethod("statistics", null, true, false);
});
</script>

<style lang="scss" scoped>
.home_page {
  padding-block: 0px;
  .container {
    @include displayFlex($direction: column, $gap: 50px);
    min-height: 100vh;
    // background: $textColor;
    max-width: unset;
    .mazaya_logo {
      max-width: 500px;
    }
    h1 {
      font-size: clamp(24px, 2.5vw, 30px);
      font-weight: 500;
    }
    .stat_items {
      .stat_item {
        border: 1px solid #e4e4e4;
        padding: 20px 15px;
        border-radius: 5px;
        flex-grow: 1;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: 0.3s;
        h3 {
          font-size: 45px;
          font-weight: 600;
          margin-bottom: 0px;
          color: $secColor;
        }
        h4 {
          font-size: 25px;
          font-weight: 400;
        }
        &:hover {
          background: #fff;
          color: $mainColor;
        }
      }
    }
  }
}
</style>
