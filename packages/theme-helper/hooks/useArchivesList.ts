import { computed } from 'vue'
import { usePostListWithPagination } from './usePostListWithPagination'

type NodeType = 'year' | 'month' | 'post' | string

interface ArchivesListItem {
  type: NodeType
  title: string
  snippets?: string
  coverImg?: string
  createTime: number
  url: string
  top?: boolean
  tags?: string[]
}

interface AppendItem {
  type: NodeType
  title: string
  [key: string]: any
}
type Option = {
  onYearAppend?: (year: number) => AppendItem
  onMonthAppend?: (month: number) => AppendItem
}

export function useArchivesList(option?: Option) {
  const { onYearAppend, onMonthAppend } = option || {}
  const { allPostList } = usePostListWithPagination()
  const data = Object.create(null)
  return computed<(ArchivesListItem | AppendItem)[]>(() => {
    for (const post of allPostList.value) {
      const { createTime } = post
      const _createTime = new Date(createTime)
      const year = _createTime.getUTCFullYear()
      const month = _createTime.getMonth() + 1
      let addYearItemFlag = false
      if (!data[year]) {
        data[year] = {}
        addYearItemFlag = true
      }
      if (!data[year][month]) {
        data[year][month] = []
        let _monthList = data[year][month]
        if (addYearItemFlag && onYearAppend) {
          _monthList.push(onYearAppend(year))
        }
        onMonthAppend && _monthList.push(onMonthAppend(month))
      }
      post.type = 'post'
      data[year][month].push(post)
    }
    let archivesList: any = []
    for (const yearItem of Object.values(data)) {
      for (const monthItem of Object.values(yearItem as Record<string, any>)) {
        archivesList.push.apply(archivesList, monthItem)
      }
    }
    return archivesList
  })
}
