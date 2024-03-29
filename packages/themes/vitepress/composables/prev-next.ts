import { computed } from 'vue'
import { useData } from './data'
import { isActive } from '../support/utils'
import { getSidebar, getFlatSideBarLinks } from '../support/sidebar'

export function usePrevNext() {
  const { page, theme, frontmatter } = useData()

  return computed(() => {
    const sidebar = getSidebar(theme.value.sidebar, page.value.relativePath)
    const candidates = getFlatSideBarLinks(sidebar)

    const index = candidates.findIndex((link) => {
      return isActive(page.value.relativePath, link.link)
    })

    return {
      prev: frontmatter.value.prev
        ? { ...candidates[index - 1], text: frontmatter.value.prev }
        : candidates[index - 1],
      next: frontmatter.value.next
        ? { ...candidates[index + 1], text: frontmatter.value.next }
        : candidates[index + 1]
    }
  })
}
