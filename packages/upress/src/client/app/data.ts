import {
  type InjectionKey,
  type Ref,
  computed,
  inject,
  readonly,
  ref,
  shallowRef
} from 'vue'
import type { Route } from './router.js'
import siteData from '@siteData'
import { type PageData, type SiteData, resolveSiteDataByRoute, createTitle } from '../../shared/shared'

export const dataSymbol: InjectionKey<UPressData> = Symbol()

export interface UPressData<T = any> {
  site: Ref<SiteData<T>>
  page: Ref<PageData>
  theme: Ref<T>
  frontmatter: Ref<PageData['frontmatter']>
  title: Ref<string>
  description: Ref<string>
  lang: Ref<string>
  isDark: Ref<boolean>
  dir: Ref<string>
  localeIndex: Ref<string>
}

// site data is a singleton
export const siteDataRef: Ref<SiteData> = shallowRef(
  (import.meta.env.PROD ? siteData : readonly(siteData)) as SiteData
)

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('/@siteData', (m) => {
    if (m) {
      siteDataRef.value = m.default
    }
  })
}

// per-app data
export function initData(route: Route): UPressData {
  const site = computed(() =>
    resolveSiteDataByRoute(siteDataRef.value, route.data.relativePath)
  )

  return {
    site,
    theme: computed(() => site.value.themeConfig),
    page: computed(() => route.data),
    frontmatter: computed(() => route.data.frontmatter),
    lang: computed(() => site.value.lang),
    dir: computed(() => site.value.dir),
    localeIndex: computed(() => site.value.localeIndex || 'root'),
    title: computed(() => {
      return createTitle(site.value, route.data)
    }),
    description: computed(() => {
      return route.data.description || site.value.description
    }),
    isDark: ref(false)
  }
}

export function useData<T = any>(): UPressData<T> {
  const data = inject(dataSymbol)
  if (!data) {
    throw new Error('upress data not properly injected in app')
  }
  return data
}
