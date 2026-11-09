<template>
  <div class="nav_menu_fields">
    <h4 class="centered">{{ $t("navMenu.title") }}</h4>

    <div class="menu_group" v-for="(item, index) in body.items" :key="index">
      <!-- Parent -->
      <div :class="['menu_item ', { has_childs: item?.hasChilds }]">
        <div class="input icon_input">
          <label>{{ $t("navMenu.icon") }}</label>
          <button class="icon_select_btn" @click="emit('openIconPicker', item)">
            <i :class="item.icon || 'pi pi-stop'"></i>
          </button>
        </div>

        <div class="input">
          <label>{{ $t("navMenu.titleLabel") }}</label>
          <input
            type="text"
            v-model="item.title"
            :placeholder="$t('navMenu.titlePlaceholder')"
          />
        </div>

        <div class="input" v-if="!item?.hasChilds">
          <label>{{ $t("navMenu.linkLabel") }}</label>
          <input
            type="text"
            v-model="item.link"
            :placeholder="$t('navMenu.linkPlaceholder')"
          />
        </div>

        <div class="input" v-if="!item.hasChilds">
          <label>{{ $t("navMenu.targetLabel") }}</label>
          <select v-model="item.target">
            <option value="_self">{{ $t("navMenu.sameTab") }}</option>
            <option value="_blank">{{ $t("navMenu.newTab") }}</option>
          </select>
        </div>

        <div class="input toggle_input">
          <ToggleSwitch v-model="item.hasChilds" @change="onToggle(index)" />
          <span>{{ $t("navMenu.hasChilds") }}</span>
        </div>

        <button
          v-if="body.items.length > 1"
          class="pi pi-trash delete_btn circled"
          @click="removeMenuItem(index)"
        ></button>
      </div>

      <!-- Childs Block -->
      <div v-if="item.hasChilds" class="submenu_block">
        <div class="submenu_block_header">
          <h5>
            {{ $t("navMenu.subMenuFor") }} <span>{{ item.title }}</span>
          </h5>
          <button class="add_sub_menu" @click="addSubMenuItem(index)">
            <i class="pi pi-plus"></i>
          </button>
        </div>

        <div
          class="submenu_item"
          v-for="(subItem, subIndex) in item.children"
          :key="`child-${index}-${subIndex}`"
        >
          <div class="icon_input input">
            <label>{{ $t("navMenu.icon") }}</label>
            <button
              class="icon_select_btn"
              @click="emit('openIconPicker', subItem)"
            >
              <i :class="subItem.icon || 'pi pi-stop'"></i>
            </button>
          </div>

          <div class="input">
            <label>{{ $t("navMenu.subTitleLabel") }}</label>
            <input
              type="text"
              v-model="subItem.title"
              :placeholder="$t('navMenu.subTitlePlaceholder')"
            />
          </div>

          <div class="input">
            <label>{{ $t("navMenu.subLinkLabel") }}</label>
            <input
              type="text"
              v-model="subItem.link"
              :placeholder="$t('navMenu.subLinkPlaceholder')"
            />
          </div>

          <div class="input" v-if="!subItem.hasChilds">
            <label>{{ $t("navMenu.subTargetLabel") }}</label>
            <select v-model="subItem.target">
              <option value="_self">{{ $t("navMenu.sameTab") }}</option>
              <option value="_blank">{{ $t("navMenu.newTab") }}</option>
            </select>
          </div>

          <button
            v-if="item.children.length > 1"
            class="pi pi-trash delete_btn circled"
            @click="removeSubMenuItem(index, subIndex)"
          ></button>
        </div>
      </div>
    </div>

    <slot></slot>

    <div class="flex_buttons">
      <button class="main-btn reversed" @click="addMenuItem">
        {{ $t("navMenu.addMenuItem") }}
      </button>
      <button class="main-btn" @click="handleSubmitNavMenu">
        {{ $t("navMenu.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const { showErrorToast } = useToastMsg();

const emit = defineEmits([
  "handleSubmitFields",
  "handleCloseComponentPopup",
  "openIconPicker",
]);

const body = reactive({
  items: [
    {
      icon: "",
      title: "",
      link: "",
      target: "_self",
      hasChilds: false,
      children: [{ icon: "", title: "", link: "", target: "_self" }],
    },
  ],
});

const props = defineProps({ values: Object });

watch(
  () => props.values,
  (values) => {
    if (!values) return;
    body.items = values?.content?.items?.map((item) => ({
      icon: item.icon ?? "",
      title: item.title ?? "",
      link: item.link ?? "",
      target: item.target ?? "_self",
      hasChilds: item.hasChilds ?? false,
      children: item.hasChilds
        ? (item.children ?? []).map((c) => ({
            icon: c.icon ?? "",
            title: c.title ?? "",
            link: c.link ?? "",
            target: c.target ?? "_self",
          }))
        : [],
    })) ?? [
      {
        icon: "",
        title: "",
        link: "",
        target: "_self",
        hasChilds: false,
        children: [],
      },
    ];
  },
  { immediate: true },
);

const addMenuItem = () => {
  body.items.push({
    icon: "",
    title: "",
    link: "",
    target: "_self",
    hasChilds: false,
    children: [],
  });
};

const removeMenuItem = (index) => {
  if (body.items.length > 1) body.items.splice(index, 1);
  else showErrorToast(t("navMenu.menuMinError"));
};

const onToggle = (index) => {
  const item = body.items[index];
  if (item.hasChilds) {
    if (!item.children) item.children = [];
    item.link = "";
  } else {
    item.children = [{ title: "", link: "", target: "_self" }];
  }
};

const addSubMenuItem = (index) => {
  body.items[index].children.push({ title: "", link: "", target: "_self" });
};

const removeSubMenuItem = (i, subIndex) => {
  body.items[i].children.splice(subIndex, 1);
};

const normalizeMenuItems = (items) => {
  return items.map((item) => {
    const normalized = { title: item.title };
    if (item.icon?.trim()) normalized.icon = item.icon;
    if (item.hasChilds) {
      normalized.hasChilds = item.hasChilds;
      if (item.children?.length)
        normalized.children = normalizeMenuItems(item.children);
    } else if (item.link) {
      normalized.link = item.link;
      if (item.target) normalized.target = item.target;
    }
    return normalized;
  });
};

const handleSubmitNavMenu = () => {
  const invalid = body.items.some((i) => {
    if (!i.title) return true;
    if (!i.hasChilds && !i.link) return true;
    if (i.hasChilds && i.children.some((c) => !c.title || !c.link)) return true;
  });
  if (invalid) {
    showErrorToast(t("navMenu.fillAllError"));
    return;
  }
  emit("handleSubmitFields", normalizeMenuItems(body.items));
  emit("handleCloseComponentPopup");
};
</script>

<style scoped lang="scss">
.nav_menu_fields {
  .menu_group {
    &:not(:last-of-type) {
      margin-bottom: 18px;
    }
    .menu_item {
      display: flex;
      align-items: center;
      width: 100%;
      border: 1px solid #e4e4e4;
      padding-inline: 0 8px;
      border-radius: 8px;
      position: relative;

      &.has_childs {
        margin-bottom: 0px;
        border-radius: 6px 6px 0 0;
        padding-inline: 10px;
      }
    }
  }

  .input {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    border: none;
    gap: 0;
    flex-grow: 1;
    margin-bottom: 0;
    label {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      text-align: start;
      width: 100%;
    }
    &:first-of-type {
      label {
        text-align: center;
      }
    }

    input,
    select {
      // padding: 6px;
      border: 1px solid #e4e4e4;
      border-radius: 4px;
    }

    select {
      font-size: 14px;
    }

    &.toggle_input {
      flex-direction: row;
      align-items: end;
      gap: 10px;
      justify-content: flex-end;
      width: fit-content;
      margin-inline-start: auto;
      flex-shrink: 0;
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }
  .icon_input {
    flex-grow: 0;
    .icon_select_btn {
      border: 1px solid #e4e4e4;
      padding: 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      transition: 0.3s;
      flex-grow: unset;
      max-width: 55px;
      &:hover {
        background: #e4e4e4;
      }
    }
  }

  .delete_btn {
    position: absolute;
    top: -10px;
    right: -5px;
  }
}

/* -----------------------------
  SUB MENU STYLE
------------------------------ */
.submenu_block {
  margin-top: 0px;
  // padding-inline: 20px 8px;
  padding-inline: 15px;
  border-radius: 0 0px 6px 6px;
  position: relative;
  padding-block: 10px 14px;
  max-height: 160px;
  overflow-y: scroll;
  margin-bottom: 20px;
  counter-reset: submenu-counter; // initialize the counter
  box-shadow: 0 1px 10px #e4e4e4;
  &::-webkit-scrollbar {
    width: 2px;
  }
  .submenu_block_header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    h5 {
      font-weight: 600;
      font-size: 14px;
      text-align: start;
      span {
        color: $secColor;
      }
    }
    .add_sub_menu {
      @include circle(35px, 4px);
      margin-inline-start: auto;
      background: $mainColor;
      color: #fff;
      border: 1px solid $mainColor;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.4s;
      &:hover {
        background: #fff;
        color: $mainColor;
      }
    }
  }

  .submenu_item {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    border: 1px solid #e4e4e4;
    border-radius: 5px;
    padding-inline: 8px; // leave space for the number
    margin-bottom: 18px;

    h4 {
      font-size: 14px;
      padding: 10px 0;
    }

    // Only add margin-bottom if it's not the last item
    &:last-of-type {
      margin-bottom: 0;
    }

    // Pseudo-element for showing order
    // &::before {
    //   content: counter(submenu-counter);
    //   counter-increment: submenu-counter;
    //   position: absolute;
    //   left: 10px;
    //   bottom: 0;
    //   // top: 50%;
    //   // transform: translateY(-50%);
    //   font-size: 40px;
    //   font-weight: bold;
    //   color: rgba(0, 0, 0, 0.1); // faded background look
    //   z-index: 0;
    // }
  }

  // &::before{
  //   content: '';
  //   position: absolute;
  //   inset-inline-start: 8px;
  //   top: 0px;
  //   width: 1px;
  //   height: 100%;
  //   border: 0.5px dashed $secColor;
  //   border-radius: 8px;
  //   // background: red;
  // }
}
</style>
