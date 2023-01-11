import { usePostListWithPagination } from './usePostListWithPagination'
import { shallowReadonly, shallowReactive } from 'vue'

export interface TagMap {
  /**
   * post count
   */
  count: number
  posts: any[]
  title: string
}

export function useTagMap() {
  const { allPostList } = usePostListWithPagination()
  const tagMap: Record<string, TagMap> = shallowReactive(Object.create(null))
  for (const post of allPostList.value) {
    if (post.tags) {
      for (const tag of post.tags) {
        if (!tagMap[tag]) {
          tagMap[tag] = {
            title: tag,
            count: 0,
            posts: []
          }
        }
        const cacheObj = tagMap[tag]
        cacheObj.count += 1
        cacheObj.posts.push(post)
      }
    }
  }
  return shallowReadonly(tagMap)
}
