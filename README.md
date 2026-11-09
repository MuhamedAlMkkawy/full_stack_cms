# **About Me**

Hi, my name is **Muhmed AlMkkawy**, and I built this Nuxt 4 project base to make my development workflow faster, cleaner, and more scalable.  
This setup includes all the modules, plugins, and configurations I commonly use when starting new Nuxt applications.

The goal of this base is to:

- Provide a ready-to-use Nuxt 4 architecture  
- Speed up project initialization  
- Standardize my development environment  
- Ensure best practices for SEO, state management, UI, and internationalization  
- Reduce repeated setup time across multiple projects  

---

# **Modules & Plugins Used in This Nuxt 4 Project**

This project uses a set of Nuxt modules, plugins, and integrations to provide UI components, state management, internationalization, styling, and build optimizations.

Below is the full list of modules from the configuration.

---

## **1. @primevue/nuxt-module**
PrimeVue component framework for UI elements.

- Auto-imports PrimeVue components  
- Uses Aura theme  
- Supports ripple, dark mode, and custom z-index  

---

## **2. @nuxtjs/i18n**
A full internationalization system providing:

- Multi-language routing  
- SEO-friendly URLs  
- RTL & LTR support  
- Lazy-loaded translations  

---

## **3. @nuxtjs/tailwindcss**
Automatic TailwindCSS integration for utility-first styling.

---

## **4. @pinia/nuxt**
State management powered by Pinia.

---

## **5. pinia-plugin-persistedstate/nuxt**
Persists Pinia stores into localStorage or cookies.

---

## **6. Auto Imports**
Auto-imports everything from:

- `/stores`
- `/composables`
- `/helpers`

---

## **7. Vite SCSS Global Imports**
Inject global SCSS utilities into every component:

```scss
@use "@/assets/scss/_variables.scss" as *;
@use "@/assets/scss/_mixins.scss" as *;
```

---

## **8. Global App Head Configuration**
Defines:

- Title  
- Meta description  
- Charset  
- Viewport  
- Initial language (`htmlAttrs`)  

---

## **9. Runtime Configuration**
Stores environment variables securely, including:

- API base URL  
- Public configuration  

---

## **10. Global CSS**
Includes:

- `assets/css/style.css`
- `primeicons/primeicons.css`

---

## **11. VeeValidate & Yup (Form Validation)**

This project uses **VeeValidate** for reactive form validation and **Yup** for schema-based validation.

### **Installation**
```bash
npm install vee-validate yup
```

### **Usage**

1. Define a validation schema using Yup:

```js
import * as yup from 'yup'

export const authSchema = yup.object({
  inputName: yup.string().required('This field is required'),
  email: yup.string().email('Invalid email').required('Email is required')
})
```

2. Wrap your form in `<VeeForm>`:

```vue
<VeeForm 
  :validation-schema="authSchema" 
  class="form" 
  @submit="handleSubmit"
  v-slot="{ meta }"
>
  <CustomField 
    name="inputName"
    type="text"
    placeholder="Enter your name"
    @updateInputField="console.log($event)"
  />

  <CustomField 
    name="email"
    type="email"
    placeholder="Enter your email"
    @updateInputField="console.log($event)"
  />

  <button type="submit" :disabled="meta.pending">Submit</button>
</VeeForm>
```

### **Explanation**
- `<VeeForm>` manages the form state and validation.  
- `:validation-schema="authSchema"` binds Yup schema for automatic validation.  
- `v-slot="{ meta }"` provides reactive metadata:  
  - `meta.pending` → shows if validation is in progress.  
  - `meta.valid` → form validity status.  
- `<CustomField>` is a reusable input component:  
  - `name` → field name (must match schema)  
  - `type` → input type (`text`, `email`, etc.)  
  - `placeholder` → placeholder text  
  - `@updateInputField` → emits the updated value to parent.  

> Multiple `<CustomField>` components can be children of `<VeeForm>` and will be automatically validated according to the schema.

---

This README summarizes the core setup, architecture, and form validation approach of this Nuxt 4 starter base.
"# CMS_Frontend" 
"# CMS_FrontEnd" 
"# full_stack_cms" 
