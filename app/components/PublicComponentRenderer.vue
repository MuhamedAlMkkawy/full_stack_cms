<template>
  <div :class="['public_component', component?.content?.customClasses]">
    <!-- Logo -->
    <div v-if="component.type === 'logo'" class="component_logo">
      <img
        v-if="component?.content?.image"
        :src="component.content.image"
        :style="{
          width: component.content.width ? `${component.content.width}px` : 'auto',
          height: component.content.height ? `${component.content.height}px` : 'auto',
          maxWidth: '100%'
        }"
        alt="Logo"
      />
    </div>

    <!-- Buttons -->
    <div v-else-if="component.type === 'buttons'" class="component_buttons flex flex-wrap gap-3">
      <a
        v-for="(btn, i) in component?.content?.buttons || []"
        :key="i"
        :href="btn.link || '#'"
        class="main-btn inline-block px-5 py-2 rounded text-white bg-teal-700 hover:bg-teal-800 transition"
      >
        {{ btn.text }}
      </a>
    </div>

    <!-- Custom HTML -->
    <div
      v-else-if="component.type === 'custom-html'"
      class="component_custom_html"
      v-html="component?.content?.html || ''"
    ></div>

    <!-- Navigation Menu -->
    <nav v-else-if="component.type === 'nav-menu'" class="component_nav_menu">
      <ul class="flex flex-wrap gap-4 items-center">
        <li v-for="(item, i) in component?.content?.items || []" :key="i">
          <a :href="item.link || '#'" class="hover:text-teal-600 font-medium">
            {{ item.title || item.label }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- Accordion -->
    <div v-else-if="component.type === 'accordion'" class="component_accordion space-y-2">
      <details
        v-for="(item, i) in component?.content?.items || []"
        :key="i"
        class="border rounded p-3 bg-white"
      >
        <summary class="font-semibold cursor-pointer select-none">
          {{ item.title }}
        </summary>
        <p class="mt-2 text-gray-700">{{ item.content }}</p>
      </details>
    </div>

    <!-- Social Media -->
    <div v-else-if="component.type === 'social-media'" class="component_social flex gap-3 text-xl">
      <a
        v-for="(link, i) in component?.content?.links || []"
        :key="i"
        :href="link.url || '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:opacity-75"
      >
        <i :class="['pi', link.icon || 'pi-share-alt']"></i>
      </a>
    </div>

    <!-- Card Slider -->
    <div v-else-if="component.type === 'card-slider'" class="component_card_slider grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(item, i) in component?.content?.items || []"
        :key="i"
        class="card_item border rounded-lg overflow-hidden shadow-sm bg-white"
      >
        <img
          v-if="item.file"
          :src="item.file"
          :alt="item.title || 'Card image'"
          class="w-full h-44 object-cover"
          loading="lazy"
        />
        <div class="p-4">
          <h4 v-if="item.title" class="font-bold text-lg mb-1">{{ item.title }}</h4>
          <p v-if="item.text" class="text-gray-600 text-sm mb-3">{{ item.text }}</p>
          <a
            v-if="item.link"
            :href="item.link"
            class="text-teal-700 font-semibold hover:underline inline-flex items-center gap-1 text-sm"
          >
            <span>Learn more</span>
            <i class="pi pi-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Fallback -->
    <div v-else class="p-4 border border-dashed rounded text-gray-500">
      <span>{{ component.type }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  component: {
    type: Object,
    required: true,
  },
});
</script>

