<template>
  <div class="tags-page">
    <div class="tags-container flex space-x-4">
      <a
        :href="`#${tag.title}`"
        class="tag flex space-x-1"
        :class="{ active: currentTag === tag.title }"
        v-for="tag in tagMap"
        @click="() => handleClickTag(tag.title)"
      >
        <span>#</span>
        <span class="tag-title">{{ tag.title }}</span>
        <span>·</span>
        <span class="tag-ref-count">{{ tag.count }}</span>
      </a>
    </div>
    <div class="post_list-container space-y-4 mt-4">
      <template v-if="currentTagPost && currentTagPost.posts && currentTagPost.posts.length">
        <div class="post_list-header">共 {{ currentTagPost.count }} 篇</div>
        <div class="post_list-content space-y-4">
          <div class="post-item space-y-2" v-for="post in currentTagPost.posts">
            <div class="post-title">
              <a :href="withBase(post.url)">
                {{ post.title }}
              </a>
            </div>
            <PostMeta :tags="post.tags" :createTime="post.createTime" />
          </div>
        </div>
      </template>
      <div class="empty" v-else v-text="currentTag ? '空空如也...' : '点击上方标签，查看标签下的所有文章'"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onBeforeMount } from 'vue'
  import { withBase } from 'vitepress'
  import { useTagMap } from '@vitepress-blog/theme-helper'
  import PostMeta from '../components/PostMeta.vue'

  const tagMap = useTagMap()
  const currentTag = ref<string | null>()
  const currentTagPost = computed(() => {
    if (currentTag.value) return tagMap[currentTag.value]
  })

  function handleClickTag(tag: string) {
    if (currentTag.value !== tag) {
      currentTag.value = tag
    } else {
      currentTag.value = null
    }
  }
  onBeforeMount(() => {
    currentTag.value = decodeURIComponent(window.location.hash?.replace('#', ''))
  })
</script>

<style lang="scss" scoped>
  .tags-page {
    margin-top: 45px;
  }
  .tags-container {
    border-bottom: 1px solid var(--vp-c-divider-light);
    padding: 1rem;
    .tag {
      color: var(--vp-c-text-1);
      display: inline-block;
      padding-right: 10px;
      font-size: 14px;
      line-height: 24px;
      cursor: pointer;
      &:hover,
      &.active {
        color: var(--vp-c-brand);
      }
    }
  }
  .post_list-container {
    border: 1px solid var(--vp-c-divider-light);
    border-radius: 6px;
    .post_list-header {
      border-bottom: 1px solid var(--vp-c-divider-light);
      padding: 1rem;
    }
    .empty {
      padding: 1rem;
    }
    .post_list-content {
      padding: 1rem;
      .post-item a {
        color: var(--vp-c-text-1);
      }
    }
  }
</style>
