<template>
  <div class="input-wrap">
    <VeeField 
      :name="props.name" 
      :type="props.type" 
      :placeholder="props.placeholder" 
      :autofocus="props.autofocus"
      @change="emit('updateInputField', $event.target.value)"
    />
    <VeeErrorMessage :name="props.name" />
  </div>
</template>

<script setup>
  // define props
  const props = defineProps({
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    autofocus: {
      type: Boolean,
      default: false
    },
  });


  // define emits
  const emit = defineEmits(['updateInputField']);
</script>

<style lang="scss" scoped>
  input{
    padding: 25px 10px;
    background: #e4e4e499;
    margin-bottom: 5px;
    border-radius: 5px;
    max-height: 40px;
  }
  
</style>




<!-- HOW TO USE THE COMPONENT -->
<!-- 
  <VeeForm 
    :validation-schema="authSchema" 
    class="form" 
    @submit="handleSubmit"
    v-slot="{ meta }"
  >
  <CustomField 
    name="inputName"
    type="inputType"
    placeholder="inputPlaceholder"
    @updateInputField="console.log($event)"
  />
  </VeeForm>
-->
<!-- 

-->