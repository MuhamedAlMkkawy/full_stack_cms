<template>
  <div class="popup">
    <div class="content">
      <button
        class="pi pi-times close_btn"
        @click="handleClose"
      ></button>

      <h4>{{ $t("pagePopup.title") }}</h4>

      <div class="input">
        <input
          type="text"
          v-model.trim="page.name"
          :placeholder="$t('pagePopup.placeholder')"
          @keydown.enter="handleSubmit"
        />
      </div>

      <button class="main-btn" @click="handleSubmit">
        {{ $t("pagePopup.submit") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { showErrorToast } = useApiMethods()

/* ------------------------
 * EMITS
 * ------------------------ */
const emit = defineEmits([
  'handleControlPage',
  'handleShowControlPagePopup'
])

/* ------------------------
 * PROPS
 * ------------------------ */
const props = defineProps({
  modifiedPage: {
    type: Object,
    default: null
  }
})

/* ------------------------
 * STATE
 * ------------------------ */
const page = ref({
  name: ''
})

/* ------------------------
 * WATCH EDIT MODE
 * ------------------------ */
watch(
  () => props.modifiedPage,
  (val) => {
    page.value.name = val?.name ?? ''
  },
  { immediate: true }
)

/* ------------------------
 * METHODS
 * ------------------------ */
const handleSubmit = () => {
  if (!page.value.name.trim()) {
    showErrorToast(t("pagePopup.emptyError"))
    return
  }

  emit('handleControlPage', { ...page.value })
  handleClose()
}

const handleClose = () => {
  page.value.name = ''
  emit('handleShowControlPagePopup')
}
</script>
