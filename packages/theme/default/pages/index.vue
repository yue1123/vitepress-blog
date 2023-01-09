<template>
  <PostItem v-for="item in postList" v-bind="item" :localePath="localePath"></PostItem>
</template>

<script setup lang="ts">
  import { postList } from '@vitepress-blog/theme-helper'
  import { useData } from 'vitepress'
  const { localePath } = useData()
</script>
