<template>
  <div class="project_page page" :style="pages.length === 0 ? 'margin: 0' : ''">
    <div class="side_bar" v-if="pages.length">
      <div class="header_image">
        <!-- <button
          :class="['back_btn ', { ar_btn: globalStore.lang == 'ar' }]"
          @click="$router.back()"
        >
          <i
            :class="`pi pi-angle-${
              globalStore.lang == 'ar' ? 'right' : 'left'
            }`"
          ></i>
        </button> -->
        <div class="image">
          <img
            src="@/assets/images/logo.png"
            :alt="t('projectEditor.alts.logo')"
            loading="lazy"
          />
        </div>
      </div>
      <hr />
      <ComponentItems
        @dragStart="onDragStartComponentFromSidebar"
        @dragEnd="onDragEndComponentFromSidebar"
      />
      <!-- <hr /> -->
      <!-- <div class="header_image">
        <div class="image">
          <img :src="currentPage?.logo" alt="logo_image" loading="lazy" />
        </div>
      </div> -->
    </div>
    <div class="project_content">
      <div class="pages flex_content">
        <div class="image">
          <img :src="getResult?.data?.logo" alt="logo_image" loading="lazy" />
        </div>
        <button
          class="add_page gradient_background"
          @click="showControlPagePopup = true"
          :title="t('projectEditor.addPage')"
        >
          <i class="pi pi-plus"></i>
          {{ t("projectEditor.addNewPage") }}
        </button>
        <ProjectControl />
      </div>
      <div class="pages flex_content">
        <!-- {{ pages }}
        {{ getResult?.pages }} -->
        <div
          v-for="page in pages"
          :key="page"
          :class="[
            'page_item',
            { active: activePage === page?._id, hidden_element: !page.visible },
          ]"
          @click="activePage = page?._id"
        >
          <span>{{ page?.name }}</span>

          <Button
            type="button"
            icon="pi pi-ellipsis-v"
            @click.stop="openMenu(page._id, $event)"
            aria-haspopup="true"
            :aria-controls="`menu_${page._id}`"
            v-if="page == currentPage"
          />

          <Menu
            :ref="(el) => (menuRefs[page._id] = el)"
            :id="`menu_${page._id}`"
            :model="getPageMenuItems(page._id)"
            :popup="true"
          />
        </div>
        <!-- <button
          class="add_page gradient_background"
          @click="showControlPagePopup = true"
          :title="t('projectEditor.addPage')"
        >
          <i class="pi pi-plus"></i>
          {{ t("projectEditor.addNewPage") }}
        </button> -->
        <!-- <button class="logout_btn main-btn danger" @click="handleLogout">
          <i class="pi pi-sign-out"></i>
        </button> -->
        <!-- <LanguageSwitch /> -->
      </div>
    </div>
    <hr />
    <div :class="['project_sections ', { 'justify-center': !pages.length }]">
      <div
        v-for="section in currentPage?.sections"
        :key="section.id"
        :class="['section ', { hidden_element: !section.visible }]"
      >
        <div class="section_header">
          <h3>{{ section.name }}</h3>
          <div class="buttons">
            <!-- v-if="section.visible" -->
            <button
              @click="handleEditSection(section)"
              class="section_control pi pi-pen-to-square"
            ></button>
            <button
              @click="
                currentPage.sections.splice(
                  currentPage.sections.indexOf(section),
                  1,
                )
              "
              class="section_control pi pi-trash"
            ></button>
            <button
              @click="section.visible = !section.visible"
              :class="[
                'section_control pi',
                `pi-eye${section.visible ? '' : '-slash'}`,
              ]"
            ></button>
          </div>
        </div>

        <div
          class="section_content flex flex-row w-full"
          @dragover.prevent="onDragOverComponent(section, $event)"
          @drop="onDropComponent(section, $event)"
        >
          <template
            v-for="(component, index) in section.components"
            :key="component._id"
          >
            <!-- PLACEHOLDER BEFORE COMPONENT -->
            <div
              v-if="
                dragOverSection === section &&
                dragOverIndex === index &&
                !isSamePosition(section, index)
              "
              class="section_component empty_placeholder"
            >
              {{ t("projectEditor.placeholders.dropHere") }}
            </div>

            <!-- COMPONENT -->
            <div
              class="section_component relative"
              :style="{
                width:
                  component?.content?.customClasses?.match(
                    /w-\[(.*?)\]/,
                  )?.[1] || '100%',
              }"
              :class="[
                component?.content?.customClasses,
                // { dragging: isDragging(component) },
              ]"
              draggable="true"
              @dragstart="
                onDragStartComponent(section, component, index, $event)
              "
              @dragover.prevent="onDragOverComponent(section, $event)"
            >
              <!-- Component content -->
              <div class="component_block">
                <span>{{ component.type }}</span>
              </div>

              <!-- Control buttons -->
              <div class="component_buttons">
                <small>{{ component?.content?.customClasses }}</small>

                <button
                  class="edit_component"
                  :title="t('projectEditor.buttons.editComponent')"
                  @click="handleSectionContent(section.id, component)"
                >
                  <i class="pi pi-pen-to-square"></i>
                </button>

                <button
                  class="remove_component"
                  :title="t('projectEditor.buttons.removeComponent')"
                  @click="removeComponent(section, index)"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>

              <!-- Resize handle -->
              <div
                class="resize_handle"
                @mousedown.prevent="startResize(section, component, $event)"
              ></div>
            </div>
            <!-- PLACEHOLDER AT END -->
            <div
              v-if="
                dragOverSection === section &&
                dragOverIndex === (section.components?.length || 0) &&
                !isSamePosition(section, section.components?.length || 0) &&
                draggedComponent
              "
              class="section_component empty_placeholder"
            >
              {{ t("projectEditor.placeholders.dropHere") }}
            </div>
          </template>
          <!-- EMPTY SECTION DROP ZONE -->
          <div
            v-if="section.components.length === 0 && draggedComponent"
            class="section_component empty_placeholder"
          >
            {{ t("projectEditor.placeholders.dropHere") }}
          </div>
        </div>
      </div>
      <div
        class="section add_section"
        :title="t('projectEditor.addSection')"
        @click="showControlSectionPopup = true"
        v-if="pages.length"
      >
        <i class="pi pi-plus"></i>
        <span>{{ t("projectEditor.addSection") }}</span>
      </div>

      <Empty v-else />
    </div>

    <button
      class="main-btn"
      :disabled="!isPageChanged"
      @click="handleSavePageContent"
    >
      {{ t("projectEditor.save") }}
    </button>

    <!-- #################### Control Section Popup ###################-->
    <ControlSectionPopup
      v-if="showControlSectionPopup"
      :modifiedSection="modifiedSection"
      @handleShowControlSectionPopup="showControlSectionPopup = false"
      @handleSectionPopup="handleSectionPopup"
    />
    <!-- ################# Control Section  Popup #####################-->
    <!-- ##################### Control Page Popup #####################-->
    <ControlPagePopup
      v-if="showControlPagePopup"
      :modifiedPage="modifiedPage"
      @handleShowControlPagePopup="showControlPagePopup = false"
      @handleControlPage="handleControlPage"
    />
    <!-- ################### Control Page  Popup ######################-->
    <!-- ############## Control Component Content  Popup ##############-->
    <ComponentPopup
      v-if="componentData.type"
      :componentData="componentData"
      @handleCloseComponentPopup="componentData = {}"
      @handleAddComponentContent="handleAddComponentContent"
    />
    <!-- ############## Control Component Content  Popup ##############-->
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

definePageMeta({
  layout: "none",
});

// -----------------------------
// DEFINE ROUTE
// -----------------------------
const route = useRoute();

// -----------------------------
// HANDLE API Methods
// -----------------------------
const { getMethod, getResult, submitMethod, submitResult, showErrorToast } =
  useApiMethods();

// ----------------------------
// HANDLE PAGE ITEM 'S MENU
// ----------------------------
const menuRefs = reactive({}); // كل Menu لكل صفحة

const openMenu = (pageId, event) => {
  const menu = menuRefs[pageId];
  if (menu) menu.toggle(event); // هذا يفتح popup
};

const getPageMenuItems = (pageId) => {
  const page = pages.value.find((p) => p._id === pageId);
  if (!page) return [];

  return [
    {
      label: page.visible
        ? t("projectEditor.menu.hide")
        : t("projectEditor.menu.show"),
      icon: page.visible ? "pi pi-eye-slash" : "pi pi-eye",
      command: () => handleHidePage(pageId),
    },
    {
      label: t("projectEditor.menu.edit"),
      icon: "pi pi-pencil",
      command: () => handleEditPage(pageId),
    },
  ];
};

// ----------------------------
// HANDLE PAGES CONTENT
// ----------------------------
const pages = ref([]);

// ----------------------------
// HANDLE ACTIVE PAGE
// ----------------------------
const activePage = ref();
const currentPage = computed(() =>
  pages.value.find((p) => p._id === activePage.value),
);

// ----------------------------
// HANDLE CONTROL SECTION POPUP
// ----------------------------
const modifiedSection = ref(null);
const showControlSectionPopup = ref(false);

const handleSectionPopup = (section) => {
  if (modifiedSection.value) {
    // EDIT MODE
    const targetSection = currentPage.value.sections.find(
      (item) => item.id === modifiedSection.value.id,
    );

    if (targetSection) {
      targetSection.name = section.name;
      targetSection.visible = section.visible;
      targetSection.layout_items = section.layout_items;
      targetSection.components = section.components;
    }
  } else {
    // ADD MODE
    currentPage.value.sections.push({
      id: currentPage.value.sections.length + 1,
      ...section,
    });
  }

  showControlSectionPopup.value = false;
  modifiedSection.value = null;
};

const handleEditSection = (section) => {
  modifiedSection.value = section;
  showControlSectionPopup.value = true;
};

// ----------------------------
// HANDLE CONTROL PAGE POPUP
// ----------------------------
const modifiedPage = ref();
const showControlPagePopup = ref(false);

const handleControlPage = (page) => {
  if (modifiedPage.value) {
    const targetPage = pages.value.find(
      (item) => item._id === modifiedPage.value._id,
    );
    if (targetPage) targetPage.name = page.name;
  } else {
    const newPage = {
      _id: (pages.value.length + 1).toString(),
      name: page.name,
      visible: true,
      sections: [],
    };
    pages.value.push(newPage);
    activePage.value = newPage._id;
  }
  showControlPagePopup.value = false;
  modifiedPage.value = null;
};

const handleHidePage = (id) => {
  const targetPage = pages?.value?.find((item) => item._id === id);
  targetPage.visible = !targetPage.visible;
};

const handleEditPage = (id) => {
  showControlPagePopup.value = true;
  const targetPage = pages?.value?.find((item) => item._id == id);
  modifiedPage.value = targetPage;
};

// ------------------------------
// HANDLE DRAG & DROP COMPONENTS
// ------------------------------
const draggedComponent = ref(null);
const dragOverSection = ref(null);
const dragOverIndex = ref(null);

const isSamePosition = (section, hoverIndex) => {
  if (!draggedComponent.value) return false;

  const { fromSection, index: fromIndex } = draggedComponent.value;

  if (fromSection !== section) return false;

  // simulate final index after removal
  let finalIndex = hoverIndex;
  if (hoverIndex > fromIndex) finalIndex--;

  return finalIndex === fromIndex;
};

const onDragOverComponent = (section, e) => {
  if (!draggedComponent.value) return;

  dragOverSection.value = section;

  const container = e.currentTarget; // directly use section_content
  const children = Array.from(
    container.querySelectorAll(".section_component:not(.empty_placeholder)"),
  );

  let index = children.length; // default to end
  for (let i = 0; i < children.length; i++) {
    const rect = children[i].getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      index = i;
      break;
    }
  }

  dragOverIndex.value = index;
};

const onDragStartComponentFromSidebar = ({ item, index, event }) => {
  draggedComponent.value = { component: item, fromSidebar: true };
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", "dragging");
};
const onDragEndComponentFromSidebar = (event) => {
  draggedComponent.value = null;
};

const onDragStartComponent = (section, component, index, e) => {
  draggedComponent.value = {
    component,
    fromSidebar: false,
    fromSection: section,
    index,
  };

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "dragging");

  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  // Clone element for drag image
  const clone = el.cloneNode(true);

  // Remove Tailwind w-[...] classes
  clone.classList.forEach((cls) => {
    if (/^w-\[.*\]$/.test(cls)) clone.classList.remove(cls);
  });

  // Set fixed width & height
  clone.style.width = "300px"; // fixed width
  clone.style.height = `${rect.height}px`; // keep original height
  clone.style.background = "#fff";
  clone.style.opacity = "0.8";

  // Hide offscreen
  clone.style.position = "fixed";
  clone.style.top = "-9999px";
  clone.style.left = "-9999px";

  document.body.appendChild(clone);

  // Use the clone as drag image, centered under cursor
  const cloneRect = clone.getBoundingClientRect();
  e.dataTransfer.setDragImage(clone, cloneRect.width / 2, cloneRect.height / 2);

  // Remove clone after drag starts
  setTimeout(() => {
    if (clone.parentNode) clone.parentNode.removeChild(clone);
  }, 0);
};

const onDropComponent = (targetSection, e) => {
  if (!draggedComponent.value) return;

  const { component, fromSidebar, fromSection, index } = draggedComponent.value;

  //  USE THE ALREADY CALCULATED INDEX
  let dropIndex = dragOverIndex.value ?? targetSection.components.length;

  if (fromSidebar) {
    const newComponent = {
      ...component,
      _id: Date.now(),
      content: {
        customClasses: "w-[100%]",
      },
    };

    targetSection.components.splice(dropIndex, 0, newComponent);
  } else {
    const fromComponents = fromSection.components;
    const toComponents = targetSection.components;

    // const fromIndex = fromComponents.findIndex((c) => c._id === component._id);
    // if (fromIndex === -1) return;

    const [movedComponent] = fromComponents.splice(index, 1);

    //  correct same-section reorder
    if (fromSection === targetSection && dropIndex > index) {
      dropIndex--;
    }
    toComponents.splice(dropIndex, 0, movedComponent);
  }

  // cleanup
  e.currentTarget.classList.remove("dragging");
  draggedComponent.value = null;
  dragOverSection.value = null;
  dragOverIndex.value = null;
};

// ---------------------
// Resize
// ---------------------
let resizing = null;
let startX = 0;
let startWidth = 0;
let containerWidth = 0;

const startResize = (section, component, e) => {
  resizing = component;
  startX = e.clientX;

  const componentEl = e.target.closest(".section_component");
  if (!componentEl) return;

  const containerEl = componentEl.parentElement;
  if (!containerEl) return;

  startWidth = componentEl.offsetWidth;
  containerWidth = containerEl.offsetWidth;

  window.addEventListener("mousemove", resizeMove);
  window.addEventListener("mouseup", stopResize);

  e.preventDefault(); // prevent text selection while resizing
};

const resizeMove = (e) => {
  if (!resizing) return;

  const deltaX = e.clientX - startX;
  let newWidth = ((startWidth + deltaX) / containerWidth) * 100;

  // Clamp width between 5% and 100%
  newWidth = Math.max(5, Math.min(100, newWidth));

  // Ensure content and customClasses exist
  if (!resizing.content) resizing.content = {};
  let classes = resizing.content.customClasses || "";

  // Remove old width class
  classes = classes.replace(/w-\[\d+%?\]/g, "").trim();

  // Add new width class
  resizing.content.customClasses = `${classes} w-[${Math.floor(
    newWidth,
  )}%]`.trim();
};

const stopResize = () => {
  resizing = null;
  window.removeEventListener("mousemove", resizeMove);
  window.removeEventListener("mouseup", stopResize);
};

// ----------------------------------
// HANDLE ADD THE COMPONENT POPUP
// ----------------------------------
const componentData = ref({});

const removeComponent = (section, index) => {
  section.components.splice(index, 1);
};

const handleSectionContent = (sectionID, component) => {
  componentData.value = {
    sectionID,
    ...component,
  };
};

const handleAddComponentContent = (data) => {
  const targetedSection = currentPage?.value.sections.find(
    (item) => item.id == data.sectionID,
  );
  if (!targetedSection)
    return showErrorToast(t("projectEditor.errors.sectionNotFound"));

  const targetComponent = targetedSection.components.find(
    (comp) => comp.id === data.id,
  );

  // console.log(targetComponent);

  if (!targetComponent)
    return showErrorToast(t("projectEditor.errors.componentNotFound"));

  targetComponent.content = data.content;
};

const originalPages = ref({});
// const originalPage = ref('')
watch(
  () => getResult?.value,
  (newValue) => {
    if (!newValue) return;

    pages.value = newValue.data.pages;
    activePage.value = newValue.data.pages[0]?._id;

    // snapshot لكل صفحة بالـ id
    newValue.data.pages.forEach((page) => {
      originalPages.value[page._id] = JSON.parse(JSON.stringify(page));
    });
  },
  { immediate: true },
);

const isPageChanged = computed(() => {
  if (!currentPage.value) return false;
  const pageId = currentPage.value._id;
  const original = originalPages.value[pageId];

  if (!original) return true;

  return JSON.stringify(currentPage.value) != JSON.stringify(original);
});

watch(
  () => submitResult?.value?.data,
  (newValue) => {
    if (!newValue || !currentPage.value) return;

    const pageId = currentPage.value._id;

    // Reset "dirty" state by updating the original snapshot
    originalPages.value[pageId] = JSON.parse(JSON.stringify(currentPage.value));
  },
);

function getDeepChangedFields(current, original) {
  if (typeof current !== "object" || current === null) return current;

  if (Array.isArray(current)) {
    // Compare array elements
    const changes = [];
    let hasChange = false;

    current.forEach((item, index) => {
      const origItem = original?.[index];
      const diff = getDeepChangedFields(item, origItem);

      if (diff !== undefined) {
        changes[index] = diff;
        hasChange = true;
      } else {
        changes[index] = undefined;
      }
    });

    return hasChange ? changes : undefined;
  }

  // For objects
  const changes = {};
  let hasChange = false;

  Object.keys(current).forEach((key) => {
    const curVal = current[key];
    const origVal = original?.[key];

    const diff = getDeepChangedFields(curVal, origVal);
    if (diff !== undefined) {
      changes[key] = diff;
      hasChange = true;
    }
  });

  return hasChange ? changes : undefined;
}

// ----------------------------
// HANDLE SAVE PAGE CONTENT
// ----------------------------
const handleSavePageContent = () => {
  if (!currentPage?.value?.sections?.length) {
    showErrorToast(t("projectEditor.errors.pageContentRequired"));
    return;
  }

  const pageId = currentPage.value._id;
  const original = originalPages.value[pageId];

  // if (!original) {
  //   showErrorToast(t("projectEditor.errors.invalidPageId"));
  //   return;
  // }

  console.log(currentPage.value);

  // Determine if this is a "new page" based on numeric short IDs vs long MongoDB-style IDs
  const isShortId = /^\d+$/.test(pageId); // true for "1", "2", "3", etc.

  const url = !isShortId
    ? `/projects/${route.params.id}/pages/${pageId}`
    : `/projects/${route.params.id}/pages`;

  // get only changed fields
  // const changedData = getChangedFields(currentPage.value, original);

  const method = !isShortId ? "PATCH" : "POST";

  submitMethod(url, true, currentPage.value, method, "");
};



// CHECK IF THE PROJECT HAS PAGES
watch(
  () => getResult?.value?.data,
  (newValue) => {
    if (newValue) {
      pages.value = newValue?.pages;
      activePage.value = newValue?.pages[0]?._id;
    }
  },
);

onMounted(() => {
  getMethod(`/projects/${route.params.id}`, null, true, false);
});
</script>

<style lang="scss" scoped>
.project_page {
  margin-inline-start: 250px;
  padding: 20px;

  .flex_content {
    @include displayFlex($justify: start, $gap: 10px);
    margin-bottom: 15px;
    &:first-of-type {
      gap: 10px;
    }

    .image {
      height: 50px;
      max-width: 150px;
      img {
        object-fit: contain;
      }
    }
    .page_item {
      background: #e4e4e450;
      color: $mainColor;
      padding: 0px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
      border-radius: 8px;
      transition: 0.3s;
      cursor: pointer;
      text-transform: capitalize;
      width: 120px;
      min-height: 42px;
      span {
        max-width: 70px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      button {
        background: transparent;
        border: none;
        color: inherit;
        width: fit-content;
        // transform: rotate(180deg);
      }

      &.hidden_element {
        background: grey !important;
        border-color: grey !important;
        cursor: default;
      }
      &:not(.active):hover {
        background: #e4e4e4;
      }
      &.active {
        background: rgb(240 93 42 / 15%);
        border: 1px solid rgb(240 93 42);
        color: rgb(240 93 42);
      }
    }
    .add_page {
      margin-inline-start: auto;
      // @include circle(40px);
      border: 1px solid $mainColor;
      display: flex;
      // align-items: center;
      justify-content: center;
      gap: 8px;
      color: #fff;
      transition: 0.6s;
      padding: 4px 8px;
      border-radius: 4px;
      // background: $mainColor;
      min-height: 42px;
      min-width: 48px !important;
      animation: pulse-m infinite 1s linear;
      i.pi {
        font-size: 15px;
        font-weight: 600;
        color: inherit;
      }
      &:hover {
        background: #fff;
        color: $mainColor;
      }
    }
    + hr {
      background: #333;
      height: 3px;
    }
  }
}
</style>
