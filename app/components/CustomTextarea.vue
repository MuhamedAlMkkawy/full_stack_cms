<template>
  <div class="input-wrap">
    <VeeField
      :name="props.name"
      as="textarea"
      :placeholder="props.placeholder"
      :rows="props.rows"
      :autofocus="props.autofocus"
      @input="emit('updateTextarea', $event.target.value)"
    />
    <VeeErrorMessage :name="props.name" />
  </div>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  rows: {
    type: Number,
    default: 9,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['updateTextarea']);
</script>

<style lang="scss" scoped>
textarea {
  padding: 15px 10px;
  background: #e4e4e499;
  margin-bottom: 5px;
  border-radius: 5px;
  resize: vertical;
  border: 1px solid #e4e4e4;
  min-height: 150px;
}

</style>
