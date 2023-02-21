// exports in this file are exposed to themes and md files via 'upress'
// so the user can do `import { useRoute, useSiteData } from 'upress'`

// generic types
export type { Router, Route } from './app/router.js'
export type { UPressData } from './app/data.js'
// theme types
export type { Theme, EnhanceAppContext } from './app/theme.js'
// shared types
export type { PageData, SiteData, HeadConfig, Header } from '@upress/types'

// composables
export { useData } from './app/data.js'
export { useRouter, useRoute } from './app/router.js'

// utilities
export { inBrowser, withBase } from './app/utils.js'

// components
export { Content } from './app/components/Content.js'
export { ClientOnly } from './app/components/ClientOnly'
export { useArchivesList, useFriendlyDate, useTagMap, usePostListWithPagination } from './app/composables'
export * from '../shared/shared'
