import { useData, type VitePressData } from 'vitepress'
import { computed, ref, readonly, shallowRef, unref } from 'vue'

export type SortType = 'CREATE_TIME' | 'RANDOM' | 'UPDATE_TIME'
const sortByHandleMap: Record<SortType | 'TOP', (...arg: any[]) => number> = {
  CREATE_TIME: (post1: any, post2: any) => {
    return +post2.__pageData.frontmatter.createTime - +post1.__pageData.frontmatter.createTime
  },
  UPDATE_TIME: (post1: any, post2: any) => {
    return +post2.__pageData.frontmatter.updateTime - +post1.__pageData.frontmatter.updateTime
  },
  RANDOM: () => {
    return Math.random() - Math.random()
  },
  TOP: (post1: any, post2: any) => {
    return +!!post2.__pageData.frontmatter.top - +!!post1.__pageData.frontmatter.top
  }
}

const allPostModule = import.meta.glob('/posts/**/*.md', { eager: true })
export function usePostListWithPagination() {
  let postArr = Object.values(allPostModule)
  const themeConfig = unref(useData().theme)
  const { size }: { size: number } = themeConfig.pagination
  const sortBy: SortType = themeConfig.sortBy
  const allPostList = shallowRef()
  const totalPage = ref<number>(Math.ceil(postArr.length / size))
  const currentPage = ref<number>(1)
  const sort = () => {
    // sort by user config and top
    postArr = postArr.sort(sortByHandleMap[sortBy]).sort(sortByHandleMap['TOP'])
    allPostList.value = postArr.map<VitePressData>((item: any) => {
      const { __pageData: pageData } = item
      return {
        url: '/' + pageData.relativePath.replace('.md', ''),
        ...pageData.frontmatter
      }
    })
  }
  sort()
  const next = () => {
    if (currentPage.value < totalPage.value) currentPage.value += 1
  }
  const prev = () => {
    if (currentPage.value > 1) currentPage.value -= 1
  }
  const postList = computed(() => {
    const startIndex = (currentPage.value - 1) * size
    const endIndex = currentPage.value * size
    return allPostList.value.slice(startIndex, endIndex)
  })

  const prevDisabled = computed<boolean>(() => currentPage.value === 1)
  const nextDisabled = computed<boolean>(() => currentPage.value === totalPage.value)

  return {
    /**
     * 下一页
     */
    next,
    /**
     * 下一页
     */
    prev,
    /**
     * 总共页数
     */
    totalPage,
    /**
     * 上一页是否禁用
     */
    prevDisabled,
    /**
     * 下一页是否禁用
     */
    nextDisabled,
    /**
     * 当前页
     */
    currentPage: readonly(currentPage),
    /**
     * 当前分页文章
     */
    postList,
    /**
     * 所有文章
     */
    allPostList
  }
}
