<template>
  <div class="popup" v-if="visible">
    <div class="content">
      <!-- CLOSE -->
      <button class="pi pi-times close_btn" @click="close"></button>

      <label for="icon_input">{{ $t("iconPicker.label") }}</label>

      <!-- SEARCH -->
      <input
        id="icon_input"
        class="icon_search"
        type="text"
        v-model="search"
        :placeholder="$t('iconPicker.placeholder')"
      />

      <!-- ICONS -->
      <div class="icons_grid">
        <button
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon_item"
          @click="select(icon)"
        >
          <i :class="icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// -----------------------------
// EMITS
// -----------------------------
const emit = defineEmits(["select", "close"]);

// -----------------------------
// V-MODEL
// -----------------------------
const visible = defineModel({ type: Boolean });

// -----------------------------
// STATE
// -----------------------------
const search = ref("");
const icons = ref([]);

// -----------------------------
// LOAD PRIME ICONS (AFTER MOUNT)
// -----------------------------
onMounted(() => {
  const styles = Array.from(document.styleSheets);
  const result = new Set();

  styles.forEach((sheet) => {
    try {
      const rules = sheet.cssRules || [];
      Array.from(rules).forEach((rule) => {
        if (!rule.selectorText) return;

        // Match: .pi-home:before OR .pi-home::before
        const match = rule.selectorText.match(/\.pi-([a-z0-9-]+)::?before/i);

        if (match && match[1]) {
          result.add(`pi pi-${match[1]}`);
        }
      });
    } catch {
      // ignore CORS-protected stylesheets
    }
  });

  icons.value = Array.from(result).sort();
});

// -----------------------------
// FILTER ICONS
// -----------------------------
const filteredIcons = computed(() => {
  if (!search.value) return icons.value;
  return icons.value.filter((icon) =>
    icon.toLowerCase().includes(search.value.toLowerCase())
  );
});

// -----------------------------
// ACTIONS
// -----------------------------
const select = (icon) => {
  emit("select", icon);
  search.value = "";
  visible.value = false;
};

const close = () => {
  visible.value = false;
  emit("close");
};
</script>

<style scoped lang="scss">
// .popup{
//   // min-height : 500px;
// }

.content {
  height: 100%;
  // padding-top: 40px;
  text-align: start;
}

.icon_search {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.icons_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
  // max-height: 600px;/
  // overflow-y: auto;
}

.icon_item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: 0.25s;
}

.icon_item:hover {
  background: #f5f5f5;
}

.icon_item i {
  font-size: 22px;
}
</style>
