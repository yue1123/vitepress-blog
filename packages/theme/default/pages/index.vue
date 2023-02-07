<template>
  <PostItem
    v-for="item in postList"
    v-bind="item"
    :localePath="site.base"
  ></PostItem>
</template>

<script setup lang="ts">
import { usePostListWithPagination } from '@penpress/theme-helper'
import { useData } from 'penpress'
const { site } = useData()
const { postList } = usePostListWithPagination()
</script>
