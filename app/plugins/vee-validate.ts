// plugins/vee-validate.ts
import { defineNuxtPlugin } from '#app'
import { configure } from 'vee-validate'
import * as yup from 'yup'
// import { yupResolver } from '@vee-validate/yup'

export default defineNuxtPlugin((nuxtApp) => {
  configure({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnInput: true,
    validateOnModelUpdate: true,
  })
  
  // Make Yup available globally if needed
  // nuxtApp.provide('yup', yup)
})