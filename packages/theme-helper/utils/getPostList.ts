export type SortType = 'CREATE_TIME' | 'RANDOM'
const sortByHandleMap: Record<SortType | 'TOP', (...arg: any[]) => number> = {
  CREATE_TIME: (post1: any, post2: any) => {
    return +!!post1.__pageData.frontmatter.createTime - +!!post2.__pageData.frontmatter.createTime
  },
  RANDOM: () => {
    return Math.random() - Math.random()
  },
  TOP: (post1: any, post2: any) => {
    return +!!post2.__pageData.frontmatter.top - +!!post1.__pageData.frontmatter.top
  }
}
export const postList = ((postsRecord) => {
  const blogConfig: any = {}
  let postArr = Object.values(postsRecord)
  const sortBy: SortType = blogConfig.sortBy || 'CREATE_TIME'
  // sort by user config
  postArr.sort(sortByHandleMap[sortBy])
  // sort by top
  postArr = postArr.sort(sortByHandleMap['TOP'])
  return postArr.map((item: any) => {
    const { __pageData: pageData } = item
    return {
      url: '/' + pageData.relativePath.replace('.md', ''),
      ...pageData.frontmatter
    }
  })
})(import.meta.glob('/posts/**/*.md', { eager: true }))
