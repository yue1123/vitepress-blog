import { DocSearchProps } from './docsearch'

export namespace DefaultTheme {
  export interface Config {
    /**
     * The logo file of the site.
     *
     * @example '/logo.svg'
     */
    logo?: ThemeableImage

    // ------
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
    // ------
    /**
     * Custom site title in navbar. If the value is undefined,
     * `config.title` will be used.
     */
    siteTitle?: string | false

    /**
     * Custom header levels of outline in the aside component.
     *
     * @default 2
     */
    outline?: Outline | Outline['level'] | false

    /**
     * Disable this to hide badge text from outline.
     *
     * @default true
     */
    outlineBadges?: boolean

    /**
     * @deprecated
     * Use `outline.label` instead.
     *
     * @default 'On this page'
     */
    outlineTitle?: string

    /**
     * The nav items.
     */
    nav?: NavItem[]

    /**
     * The sidebar items.
     */
    sidebar?: Sidebar

    /**
     * Info for the edit link. If it's undefined, the edit link feature will
     * be disabled.
     */
    editLink?: EditLink

    /**
     * Set custom last updated text.
     *
     * @default 'Last updated'
     */
    lastUpdatedText?: string

    /**
     * Set custom prev/next labels.
     */
    docFooter?: DocFooter

    /**
     * The social links to be displayed at the end of the nav bar. Perfect for
     * placing links to social services such as GitHub, Twitter, Facebook, etc.
     */
    socialLinks?: SocialLink[]

    /**
     * The footer configuration.
     */
    footer?: Footer

    /**
     * @default 'Appearance'
     */
    darkModeSwitchLabel?: string

    /**
     * @default 'Menu'
     */
    sidebarMenuLabel?: string

    /**
     * @default 'Return to top'
     */
    returnToTopLabel?: string

    /**
     * The algolia options. Leave it undefined to disable the search feature.
     */
    algolia?: AlgoliaSearchOptions

    /**
     * The carbon ads options. Leave it undefined to disable the ads feature.
     */
    carbonAds?: CarbonAdsOptions

    /**
     * Changing locale when current url is `/foo` will redirect to `/locale/foo`.
     *
     * @default true
     */
    i18nRouting?: boolean
  }

  // nav -----------------------------------------------------------------------

  export type NavItem = NavItemWithLink | NavItemWithChildren

  export type NavItemWithLink = {
    text: string
    link: string

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
  }

  export type NavItemChildren = {
    text?: string
    items: NavItemWithLink[]
  }

  export interface NavItemWithChildren {
    text?: string
    items: (NavItemChildren | NavItemWithLink)[]

    /**
     * `activeMatch` is expected to be a regex string. We can't use actual
     * RegExp object here because it isn't serializable
     */
    activeMatch?: string
  }

  // image ---------------------------------------------------------------------

  export type ThemeableImage = string | { src: string; alt?: string } | { light: string; dark: string; alt?: string }

  export type FeatureIcon =
    | string
    | { src: string; alt?: string; width?: string; height: string }
    | {
        light: string
        dark: string
        alt?: string
        width?: string
        height: string
      }

  // sidebar -------------------------------------------------------------------

  export type Sidebar = SidebarItem[] | SidebarMulti

  export interface SidebarMulti {
    [path: string]: SidebarItem[]
  }

  export type SidebarItem = {
    /**
     * The text label of the item.
     */
    text?: string

    /**
     * The link of the item.
     */
    link?: string

    /**
     * The children of the item.
     */
    items?: SidebarItem[]

    /**
     * If not specified, group is not collapsible.
     *
     * If `true`, group is collapsible and collapsed by default
     *
     * If `false`, group is collapsible but expanded by default
     */
    collapsed?: boolean
  }

  // edit link -----------------------------------------------------------------

  export interface EditLink {
    /**
     * Pattern for edit link.
     *
     * @example 'https://github.com/vuejs/vitepress/edit/main/docs/:path'
     */
    pattern: string

    /**
     * Custom text for edit link.
     *
     * @default 'Edit this page'
     */
    text?: string
  }

  // prev-next -----------------------------------------------------------------

  export interface DocFooter {
    /**
     * Custom label for previous page button.
     *
     * @default 'Previous page'
     */
    prev?: string

    /**
     * Custom label for next page button.
     *
     * @default 'Next page'
     */
    next?: string
  }

  // social link ---------------------------------------------------------------

  export interface SocialLink {
    icon: SocialLinkIcon
    link: string
  }

  export type SocialLinkIcon =
    | 'discord'
    | 'facebook'
    | 'github'
    | 'instagram'
    | 'linkedin'
    | 'mastodon'
    | 'slack'
    | 'twitter'
    | 'youtube'
    | { svg: string }

  // footer --------------------------------------------------------------------

  export interface Footer {
    message?: string
    copyright?: string
  }

  // team ----------------------------------------------------------------------

  export interface TeamMember {
    avatar: string
    name: string
    title?: string
    org?: string
    orgLink?: string
    desc?: string
    links?: SocialLink[]
    sponsor?: string
  }

  // outline -------------------------------------------------------------------

  export interface Outline {
    level?: number | [number, number] | 'deep'
    label?: string
  }

  // algolia -------------------------------------------------------------------

  /**
   * The Algolia search options. Partially copied from
   * `@docsearch/react/dist/esm/DocSearch.d.ts`
   */
  export interface AlgoliaSearchOptions extends DocSearchProps {
    locales?: Record<string, Partial<DocSearchProps>>
  }

  // carbon ads ----------------------------------------------------------------

  export interface CarbonAdsOptions {
    code: string
    placement: string
  }
}
