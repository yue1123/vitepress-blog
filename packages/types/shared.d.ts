// types shared between server and client
import type { SSRContext } from 'vue/server-renderer'

export type Awaitable<T> = T | PromiseLike<T>

export interface PageData {
  relativePath: string
  title: string
  titleTemplate?: string | boolean
  description: string
  headers: Header[]
  frontmatter: Record<string, any>
  lastUpdated?: number
}

export interface Header {
  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number
  /**
   * The title of the header
   */
  title: string
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  slug: string
  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string
  /**
   * The children of the header
   */
  children: Header[]
}

export interface SiteData<ThemeConfig = any> {
  base: string
  cleanUrls?: boolean
  lang: string
  dir: string
  title: string
  rss?: {
    email?: string
    host?: string
  }
  titleTemplate?: string | boolean
  description: string
  head: HeadConfig[]
  appearance: boolean | 'dark'
  themeConfig: ThemeConfig
  scrollOffset: number | string
  locales: LocaleConfig<ThemeConfig>
  localeIndex?: string
}

export type HeadConfig = [string, Record<string, string>] | [string, Record<string, string>, string]

export interface PageDataPayload {
  path: string
  pageData: PageData
}

export interface SSGContext extends SSRContext {
  content: string
}

export interface CommonThemeConfig {
  // -------------------------------
  /**
   * Nickname or github username.
   */
  name?: string
  /**
   * Post snippets string length.
   * @default 50
   */
  snippetsLength?: number
  /**
   * post add tag by file path
   * @examples { test: /notes/, tag: '随笔' }
   * @default []
   */
  filePathToTags?: {
    /**
     * Match regex.
     */
    test: RegExp
    /**
     * The tag patch to post.
     */
    tag: string | string[]
  }[]
  /**
   * Post sort by.
   * @enum[] CREATE_TIME Sort by create time, newest will be top.
   * @enum[] RANDOM Sort y random.
   * @enum[] UPDATE_TIME Sort by update time, newest will be top.
   * @default 'CREATE_TIME'
   */
  sortBy?: 'CREATE_TIME' | 'RANDOM' | 'UPDATE_TIME'
  /**
   * Post title
   * @enum[] fileName Use filename as post title.
   * @enum[] contentTitle Use markdown content first level title or secondary as post title
   * @default fileName
   */
  titleOrder?: 'fileName' | 'contentTitle'
  /**
   * Pagination configuration
   * @default { prevText: 'Prev page', nextText: 'Next page', size: 10, pagerCount: 7, hideOnSinglePage: true }
   */
  pagination?: {
    /**
     * Prev page button text.
     * @default 'Prev page'
     */
    prevText?: string
    /**
     * Next page button text.
     * @default 'Next page'
     */
    nextText?: string
    /**
     * The number displayed on each page
     * @default 10
     */
    size?: number
    /**
     * The number of page number buttons, the paging buttons can be collapsed according to this property
     * @default 7
     */
    pagerCount?: number
    /**
     * Hide pager buttons when there is only one page
     * @default true
     */
    hideOnSinglePage?: boolean
  }
}

export interface LocaleSpecificConfig<ThemeConfig = any> {
  lang?: string
  dir?: string
  title?: string
  titleTemplate?: string | boolean
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig & CommonThemeConfig
}

export type LocaleConfig<ThemeConfig = any> = Record<
  string,
  LocaleSpecificConfig<ThemeConfig> & { label: string; link?: string }
>
