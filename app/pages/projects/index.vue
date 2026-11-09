<template>
  <div class="page projects_page gradient_background">
    <div class="container">
      <!-- <div class="image mazaya_logo">
        <img
          src="@/assets/images/logo.png"
          :alt="$t('projects.logoAlt')"
          loading="lazy"
        />
      </div> -->

      <div class="content_items items_4" v-if="getResult?.data">
        <NuxtLink
          v-for="project in getResult?.data"
          :key="project._id"
          :to="project.visible ? $localeRoute(`/projects/${project._id}`) : ''"
          :class="['content_item', { drafted_item: !project.visible }]"
        >
          <div class="image">
            <img :src="project.logo" :alt="project?.name" loading="lazy" />
          </div>

          <div class="item_control">
            <button
              :class="[
                'draft_btn pi',
                project.visible ? 'pi-eye-slash' : 'pi-eye',
              ]"
              :title="
                project.visible ? $t('projects.draft') : $t('projects.undraft')
              "
              @click.stop.prevent="
                handleDraftProject(project._id, project.visible)
              "
            ></button>
          </div>
        </NuxtLink>

        <NuxtLink
          :to="$localeRoute('/modify_project')"
          class="content_item add_project"
          :title="$t('projects.addProject')"
        >
          <i class="pi pi-plus"></i>
        </NuxtLink>
      </div>
      <Empty v-else />
    </div>
  </div>
</template>

<script setup>
const { getMethod, submitMethod, getResult } = useApiMethods();

// definePageMeta({
//   layout: "none",
// });

//  HANDLE DRAFT THE PROJECT
const handleDraftProject = (projectID, projectVisible) => {
  submitMethod(
    `projects/${projectID}`,
    true,
    {
      visible: !projectVisible,
    },
    "PATCH",
    "",
    "projects"
  );
};

onMounted(() => {
  getMethod("projects", null, true, false);
});
</script>

<style lang="scss" scoped>
.projects_page {
  padding-block: 90px 20px;
  .container {
    @include displayFlex($direction: column, $gap: 50px);
    // min-height: 100vh;
    // background: $textColor;
    max-width: unset;
    .mazaya_logo {
      max-width: 400px;
    }
    .content_items {
      // @include displayFlex($wrap : wrap , $align : stretch , $gap : 20px);
      max-width: 100% !important;
      .content_item {
        border: 1px solid #fff;
        padding: 20px 8px;
        border-radius: 4px;
        transition: 0.6s;
        position: relative;
        width: 100%;
        min-height: 88px;
        background: #fff;
        .image {
          max-width: 180px;
          height: 80px;
          margin: 0 auto;
          transition: 1s;
          img{
            object-fit: contain;
          }
        }
        &.drafted_item{
          .image{
            filter: brightness(0.5);
          }
        }
        .item_control {
          @include displayFlex($gap: 5px);
          position: absolute;
          top: 5px;
          inset-inline-end: 5px;
          z-index: 9;
          opacity: 0;
          button {
            border: 1px solid;
            padding: 8px;
            font-size: 15px;
            border-radius: 4px;
            &.edit_btn {
              color: $mainColor;
              &:hover {
                background: $mainColor;
                color: #fff;
              }
            }
            &.draft_btn {
              color: $dangerColor;
              border-color: $dangerColor;
              &:hover {
                background: $dangerColor;
                color: #fff;
              }
            }
          }
        }
        &:hover {
          background: #fff;
          .image {
            filter: unset;
          }
          .item_control {
            opacity: 1;
          }
        }
        &.drafted_item {
          cursor: default;
        }
      }
    }
  }
  .add_project {
    border-style: dashed !important;
    @include displayFlex();
    cursor: pointer;
    background: transparent !important;
    i {
      font-size: 30px;
    }
    &:hover {
      color: $mainColor;
      background: #fff !important;
    }
  }
}
</style>
