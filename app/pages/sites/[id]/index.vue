<template>
  <div class="public_site min-h-screen bg-gray-50 text-gray-900">
    <div v-if="loading" class="flex justify-center items-center min-h-screen">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-teal-600 mb-3"></i>
        <p class="text-gray-600">Loading website...</p>
      </div>
    </div>

    <div v-else-if="!site" class="flex justify-center items-center min-h-screen">
      <div class="text-center max-w-md p-6 bg-white shadow rounded-lg">
        <i class="pi pi-exclamation-circle text-5xl text-amber-500 mb-3"></i>
        <h2 class="text-2xl font-bold mb-2">Site Not Published</h2>
        <p class="text-gray-600 mb-4">
          This website has not been published yet or the link is invalid.
        </p>
        <NuxtLink :to="$localeRoute('/projects')" class="main-btn">
          Go to Dashboard
        </NuxtLink>
      </div>
    </div>

    <div v-else class="site_wrapper">
      <!-- Site Header / Nav -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-30">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between">
          <div class="site_brand flex items-center gap-3">
            <img v-if="site.logo" :src="site.logo" alt="Logo" class="h-10 object-contain" />
            <span class="text-xl font-bold">{{ site.name }}</span>
          </div>

          <!-- Page Tabs -->
          <nav v-if="site.pages?.length > 1" class="flex gap-2">
            <button
              v-for="page in site.pages.filter(p => p.visible)"
              :key="page.id"
              :class="[
                'px-4 py-2 rounded-md font-medium text-sm transition',
                activePageId === page.id ? 'bg-teal-700 text-white' : 'text-gray-700 hover:bg-gray-100'
              ]"
              @click="activePageId = page.id"
            >
              {{ page.name }}
            </button>
          </nav>
        </div>
      </header>

      <!-- Active Page Sections -->
      <main class="container mx-auto px-4 py-8 space-y-12">
        <section
          v-for="section in currentPage?.sections?.filter(s => s.visible)"
          :key="section.id"
          :class="['section_wrapper py-6', section.custom_classes]"
        >
          <div v-if="section.name" class="mb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{ section.name }}</h2>
          </div>

          <div class="section_components flex flex-wrap gap-4 items-center">
            <div
              v-for="component in section.components"
              :key="component.id || component._id"
              :style="{
                width: component?.content?.customClasses?.match(/w-\[(.*?)\]/)?.[1] || '100%'
              }"
              class="component_item"
            >
              <PublicComponentRenderer :component="component" />
            </div>
          </div>
        </section>
      </main>

      <footer class="border-t bg-white py-6 mt-16 text-center text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} {{ site.name }}. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { usePublishing } from '@/composables/usePublishing';

definePageMeta({
  layout: false,
});

const route = useRoute();
const projectId = route.params.id;
const { getPublishedSnapshot } = usePublishing();

const loading = ref(true);
const site = ref(null);
const activePageId = ref(null);

const currentPage = computed(() => {
  if (!site.value?.pages?.length) return null;
  return site.value.pages.find((p) => p.id === activePageId.value || p._id === activePageId.value) || site.value.pages[0];
});

onMounted(async () => {
  try {
    const data = await getPublishedSnapshot(projectId);
    site.value = data;
    if (data?.pages?.length) {
      activePageId.value = data.pages[0].id || data.pages[0]._id;
    }
  } catch (err) {
    console.error('[PublicSite] Error loading published snapshot:', err);
  } finally {
    loading.value = false;
  }
});
</script>

