<template>
  <div class="input">
    <label v-if="label" :for="id">{{ label }}</label>
    <!-- <div class="input-wrap"> -->
      <input
        :id="id"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
        placeholder="e.g. rounded-lg shadow-md text-center"
        :class="['classes-input', className]"
      />
    <!-- </div> -->
  </div>
</template>

<script setup>
defineProps({
  label: String,
  id: String,
  modelValue: String,
  placeholder: String,
  className: String
})

const emit = defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
.input {
  margin-block: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px !important;
  border: 1px solid #ddd !important;
}
label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0px;
  width: 100%;
  text-align: start;
}
.classes-input {
  width: 100%;
  padding: 9px 10px;
  // border-bottom: 1px solid #ddd;
  border-radius: 6px;
}
</style>



<!-- HOW TO USE THE COMPONENT -->
<!-- 
  <ClassesInput
    v-model="menu.customClasses"
    id="custom_classes"
    label="CSS Classes"
    placeholder="e.g. rounded-lg shadow-md text-center"
  />
-->
<!-- HOW TO USE THE COMPONENT -->