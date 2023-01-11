<template>
  <PostItem v-for="item in postList" v-bind="item" :localePath="localePath"></PostItem>
</template>

<script setup lang="ts">
  import { usePostListWithPagination } from '@vitepress-blog/theme-helper'
  import { useData } from 'vitepress'
  const { localePath } = useData()
  const { postList } = usePostListWithPagination()
</script>