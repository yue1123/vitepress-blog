<template>
  <div class="post_item-container">
    <div class="post_item-content">
      <a :href="withBase(url)">
        <h2>
          {{ props.title }}
        </h2>
        <Badge v-if="props.top" type="tip" text="置顶" />
      </a>
      <p>{{ props.snippets }}</p>
      <PostMeta :tags="props.tags" :createTime="props.createTime" />
    </div>
    <div class="post_item-image" v-if="props.coverImg">
      <img :src="coverImg" alt="coverImg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import PostMeta from './PostMeta.vue'
import { withBase } from 'upress'
import { computed } from 'vue'
export interface Props {
  title: string
  snippets?: string
  coverImg?: string
  createTime: number | string
  localePath: string
  url: string
  top?: boolean
  tags?: string[]
}

const props = defineProps<Props>()
const coverImg = computed(() => {
  const coverImg = props.coverImg
  if (coverImg && !coverImg.startsWith(props.localePath)) {
    return withBase(coverImg)
  }
  return coverImg
})
</script>

<style lang="scss" scoped>
.post_item {
  &-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid var(--vp-c-divider);
    margin: 15px 0 16px;
    &:first-child {
      border: none;
    }

    a {
      display: inline-flex;
      align-items: center;
      color: var(--vp-c-text-1);
      margin-top: 15px;
      h2 {
        margin: 0;
        border: none;
      }
    }
    :deep(.VPBadge) {
      margin-top: 25px;
      margin-left: 15px;
    }
  }

  &-content p {
    word-break: break-all;
  }
  &-meta {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .create_time {
      display: flex;
      align-items: center;
      font-size: 14px;
      line-height: 14px;
    }
  }
  &-image {
    width: 120px;
    margin: 15px 0 15px 25px;
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;
    display: none;
    line-height: 0;
    @media screen and (min-width: 768px) {
      display: inline-block;
    }
  }
}
</style>
