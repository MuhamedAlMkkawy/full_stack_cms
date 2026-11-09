<template>
  <div class="components">
    <div
      v-for="item in getResult?.data ?? []"
      :key="item.type"
      class="component_item"
      draggable="true"
      @dragstart="dragStart(item, index, $event)"
      @dragend="dragEnd($event)"
    >
      <i :class="['component_icon pi', item.icon]" />
      <span class="component_title">{{ item.label }}</span>
      <i class="pi pi-equals"></i>
    </div>
  </div>
</template>

<script setup>
const { getMethod, getResult } = useApiMethods()

// 👇 MATCH PARENT EVENT NAMES EXACTLY
const emit = defineEmits(['dragStart', 'dragEnd'])

const dragStart = (item, index, e) => {
  emit("dragStart", { item, index, event: e });
};

const dragEnd = (e) => {
  emit("dragEnd", e);
};

onMounted(() => {
  getMethod('components', null, true, false)
})
</script>
