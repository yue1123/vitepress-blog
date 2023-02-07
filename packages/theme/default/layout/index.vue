<template>
  <ClientOnly>
    <BackgroundVue />
  </ClientOnly>
  <Layout>
    <template #doc-before v-if="isPost">
      <PostHeader />
    </template>

    <template v-if="isPost" #doc-after>
      <ClientOnly>
        <PostBottom />
      </ClientOnly>
    </template>
  </Layout>
</template>

<script setup lang="ts">
  import BackgroundVue from '../components/Background/index.vue'
  import defaultTheme from 'penpress/theme'
  import { useData } from 'penpress'
  import { computed } from 'vue'
  const { Layout } = defaultTheme
  const { frontmatter } = useData()
  const isPost = computed<boolean>(() => !!frontmatter.value.isPost)
</script>
