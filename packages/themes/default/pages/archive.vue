<template>
  <div class="archive-page">
    <div class="timeline-container">
      <div class="timeline-item" :class="item.type" v-for="item in archivesList">
        <div class="timeline-item-node">
          <BIconPencilSquare v-if="item.type === 'post'" />
          <span v-else-if="item.type === 'month'">月</span>
          <span v-else>年</span>
        </div>
        <div class="timeline-item-wrapper space-y-2">
          <template v-if="item.type === 'post'">
            <div class="content">
              <a v-if="item.type === 'post'" :href="withBase(item.url)">
                {{ item.title }}
              </a>
            </div>
            <PostMeta :tags="item.tags" :createTime="item.createTime" />
          </template>
          <div class="content" v-else>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { BIconPencilSquare } from 'bootstrap-icons-vue'
  import { withBase } from 'upress'
  import PostMeta from '../components/PostMeta.vue'
  import { useArchivesList } from 'upress'

  const archivesList = useArchivesList({
    onYearAppend(year) {
      return {
        type: 'year',
        title: `${year} 年`
      }
    },
    onMonthAppend(month) {
      return {
        type: 'month',
        title: `${month}月`
      }
    }
  })
</script>

<style lang="scss" scoped>
  .archive-page {
    margin-top: 45px;
  }
  .timeline {
    &-item {
      position: relative;
      padding-bottom: 15px;
      display: flex;
      padding: 10px 0;
      $node-width: 30px;
      &.year {
        &:not(:first-child) {
          margin-top: 30px;
        }
        .timeline-item-wrapper {
          font-size: 36px;
        }
      }
      &.month .timeline-item-wrapper {
        font-size: 24px;
      }
      &:not(:last-child)::before {
        content: '';
        position: absolute;
        display: block;
        left: calc($node-width / 2);
        width: 0;
        top: calc(50% - calc($node-width / 2));
        bottom: -40px;
        border-left: 1px dashed var(--vp-c-divider);
      }
      &-node {
        width: $node-width;
        height: $node-width;
        background: var(--vp-c-bg-soft);
        border-radius: 50%;
        z-index: 9;
        left: 0;
        margin-right: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--vp-c-text-2);
        font-size: 12px;
      }
      .timeline-item-wrapper a {
        color: var(--vp-c-text-1);
        &:hover {
          color: var(--vp-c-brand);
        }
      }
    }
  }
</style>
