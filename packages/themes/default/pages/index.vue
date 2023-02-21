<template>
  <PostItem
    v-for="item in postList"
    v-bind="item"
    :localePath="site.base"
  ></PostItem>
</template>

<script setup lang="ts">
import { usePostListWithPagination } from 'upress'
import { useData } from 'upress'
const { site } = useData()
const { postList } = usePostListWithPagination()
</script>
