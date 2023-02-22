import type { Options as VuePluginOptions } from '@vitejs/plugin-vue'
import _debug from 'debug'
import fg from 'fast-glob'
import fs from 'fs-extra'
import path from 'path'
import { match, compile } from 'path-to-regexp'
import c from 'picocolors'
import { loadConfigFromFile, mergeConfig as mergeViteConfig, normalizePath, type UserConfig as ViteConfig } from 'vite'
import { DEFAULT_THEME_PATH } from './alias'
import type { MarkdownOptions } from './markdown/markdown'
import {
  APPEARANCE_KEY,
  type Awaitable,
  type HeadConfig,
  type LocaleConfig,
  type LocaleSpecificConfig,
  type PageData,
  type SiteData,
  type SSGContext
} from './shared'

const debug = _debug('upress:config')

export interface UserConfig<ThemeConfig = any> extends LocaleSpecificConfig<ThemeConfig> {
  extends?: RawConfigExports<ThemeConfig>
  base?: string
  srcDir?: string
  srcExclude?: string[]
  outDir?: string
  /**
   * FIXME: refactor here
   * rss config
   */
  rss?: {
    email?: string
    host?: string
  }
  /**
   * theme name
   */
  theme?: string
  cacheDir?: string
  shouldPreload?: (link: string, page: string) => boolean

  locales?: LocaleConfig<ThemeConfig>

  appearance?: boolean | 'dark'
  lastUpdated?: boolean

  /**
   * MarkdownIt options
   */
  markdown?: MarkdownOptions
  /**
   * Options to pass on to `@vitejs/plugin-vue`
   */
  vue?: VuePluginOptions
  /**
   * Vite config
   */
  vite?: ViteConfig

  /**
   * Configure the scroll offset when the theme has a sticky header.
   * Can be a number or a selector element to get the offset from.
   */
  scrollOffset?: number | string

  /**
   * Enable MPA / zero-JS mode.
   * @experimental
   */
  mpa?: boolean

  /**
   * Don't fail builds due to dead links.
   *
   * @default false
   */
  ignoreDeadLinks?: boolean | 'localhostLinks'

  /**
   * Don't force `.html` on URLs.
   *
   * @default false
   */
  cleanUrls?: boolean

  /**
   * Use web fonts instead of emitting font files to dist.
   * The used theme should import a file named `fonts.(s)css` for this to work.
   * If you are a theme author, to support this, place your web font import
   * between `webfont-marker-begin` and `webfont-marker-end` comments.
   *
   * @default true in webcontainers, else false
   */
  useWebFonts?: boolean

  /**
   * @experimental
   *
   * source -> destination
   */
  rewrites?: Record<string, string>

  /**
   * Build end hook: called when SSG finish.
   * @param siteConfig The resolved configuration.
   */
  buildEnd?: (siteConfig: SiteConfig) => Awaitable<void>

  /**
   * Render end hook: called when SSR rendering is done.
   */
  postRender?: (context: SSGContext) => Awaitable<SSGContext | void>

  /**
   * Head transform hook: runs before writing HTML to dist.
   *
   * This build hook will allow you to modify the head adding new entries that cannot be statically added.
   */
  transformHead?: (context: TransformContext) => Awaitable<HeadConfig[]>

  /**
   * HTML transform hook: runs before writing HTML to dist.
   */
  transformHtml?: (code: string, id: string, ctx: TransformContext) => Awaitable<string | void>

  /**
   * PageData transform hook: runs when rendering markdown to vue
   */
  transformPageData?: (pageData: PageData) => Awaitable<Partial<PageData> | { [key: string]: any } | void>
}

export interface TransformContext {
  siteConfig: SiteConfig
  siteData: SiteData
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
  content: string
}

export type RawConfigExports<ThemeConfig = any> =
  | Awaitable<UserConfig<ThemeConfig>>
  | (() => Awaitable<UserConfig<ThemeConfig>>)

export interface SiteConfig<ThemeConfig = any>
  extends Pick<
    UserConfig,
    | 'markdown'
    | 'vue'
    | 'vite'
    | 'shouldPreload'
    | 'mpa'
    | 'lastUpdated'
    | 'ignoreDeadLinks'
    | 'cleanUrls'
    | 'useWebFonts'
    | 'postRender'
    | 'buildEnd'
    | 'transformHead'
    | 'transformHtml'
    | 'transformPageData'
  > {
  root: string
  srcDir: string
  site: SiteData<ThemeConfig>
  configPath: string | undefined
  configDeps: string[]
  themeDir: string
  outDir: string
  cacheDir: string
  tempDir: string
  pages: string[]
  rewrites: {
    map: Record<string, string | undefined>
    inv: Record<string, string | undefined>
  }
}

const resolve = (root: string, file: string) => normalizePath(path.resolve(root, `.upress`, file))

/**
 * Type config helper
 */
// export function defineConfig(config: UserConfig<DefaultTheme.Config>) {
//   return config
// }
/**
 * Type config helper for custom theme config
 */
export function defineConfig<ThemeConfig = {}>(config: UserConfig<ThemeConfig>) {
  return config
}

export async function resolveConfig(
  root: string = process.cwd(),
  command: 'serve' | 'build' = 'serve',
  mode = 'development'
): Promise<SiteConfig> {
  const [userConfig, configPath, configDeps] = await resolveUserConfig(root, command, mode)
  const site = await resolveSiteData(root, userConfig)
  const srcDir = path.resolve(root, userConfig.srcDir || './site')
  const outDir = userConfig.outDir ? path.resolve(root, userConfig.outDir) : resolve(root, 'dist')
  const cacheDir = userConfig.cacheDir
    ? path.resolve(root, userConfig.cacheDir)
    : resolve(process.cwd(), '../node_modules/.upress/cache')
  const configThemeDir = userConfig.theme ? path.join(process.cwd(), '/node_modules/', userConfig.theme) : null
  const markdownConfig = mergeViteConfig(
    {
      chart: {
        plantuml: {
          server: 'https://www.plantuml.com/plantuml'
        }
      }
    },
    userConfig.markdown || {}
  )
  // resolve theme path or userConfig.theme
  const userThemeDir = resolve(root, 'theme')
  const themeDir = (await fs.pathExists(userThemeDir))
    ? userThemeDir
    : configThemeDir
    ? configThemeDir
    : DEFAULT_THEME_PATH
  // Important: fast-glob doesn't guarantee order of the returned files.
  // We must sort the pages so the input list to rollup is stable across
  // builds - otherwise different input order could result in different exports
  // order in shared chunks which in turns invalidates the hash of every chunk!
  // JavaScript built-in sort() is mandated to be stable as of ES2019 and
  // supported in Node 12+, which is required by Vite.
  const pages = (
    await fg(['**.md'], {
      cwd: srcDir,
      ignore: ['**/node_modules', ...(userConfig.srcExclude || [])]
    })
  ).sort()
  const rewriteEntries = Object.entries(userConfig.rewrites || {})

  const rewrites = rewriteEntries.length
    ? Object.fromEntries(
        pages
          .map((src) => {
            for (const [from, to] of rewriteEntries) {
              const dest = rewrite(src, from, to)
              if (dest) return [src, dest]
            }
          })
          .filter((e) => e != null) as [string, string][]
      )
    : {}
  const config: SiteConfig = {
    root,
    srcDir,
    site,
    themeDir,
    pages,
    configPath,
    configDeps,
    outDir,
    cacheDir,
    tempDir: resolve(process.cwd(), '../node_modules/.upress/temp'),
    markdown: markdownConfig,
    lastUpdated: userConfig.lastUpdated,
    vue: userConfig.vue,
    vite: userConfig.vite,
    shouldPreload: userConfig.shouldPreload,
    mpa: !!userConfig.mpa,
    ignoreDeadLinks: userConfig.ignoreDeadLinks,
    cleanUrls: !!userConfig.cleanUrls,
    useWebFonts: userConfig.useWebFonts ?? typeof process.versions.webcontainer === 'string',
    postRender: userConfig.postRender,
    buildEnd: userConfig.buildEnd,
    transformHead: userConfig.transformHead,
    transformHtml: userConfig.transformHtml,
    transformPageData: userConfig.transformPageData,
    rewrites: {
      map: rewrites,
      inv: Object.fromEntries(Object.entries(rewrites).map((a) => a.reverse()))
    }
  }

  return config
}

const supportedConfigExtensions = ['js', 'ts', 'cjs', 'mjs', 'cts', 'mts']

async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: string
): Promise<[UserConfig, string | undefined, string[]]> {
  // load user config
  const configPath = supportedConfigExtensions
    .flatMap((ext) => [resolve(root, `config/index.${ext}`), resolve(root, `config.${ext}`)])
    .find(fs.pathExistsSync)

  let userConfig: RawConfigExports = {}
  let configDeps: string[] = []
  if (!configPath) {
    debug(`no config file found.`)
  } else {
    const configExports = await loadConfigFromFile({ command, mode }, configPath, root)
    if (configExports) {
      userConfig = configExports.config
      configDeps = configExports.dependencies.map((file) => normalizePath(path.resolve(file)))
    }
    debug(`loaded config at ${c.yellow(configPath)}`)
  }

  return [await resolveConfigExtends(userConfig), configPath, configDeps]
}

async function resolveConfigExtends(config: RawConfigExports): Promise<UserConfig> {
  const resolved = await (typeof config === 'function' ? config() : config)
  if (resolved.extends) {
    const base = await resolveConfigExtends(resolved.extends)
    return mergeConfig(base, resolved)
  }
  return resolved
}

function mergeConfig(a: UserConfig, b: UserConfig, isRoot = true) {
  const merged: Record<string, any> = { ...a }
  for (const key in b) {
    const value = b[key as keyof UserConfig]
    if (value == null) {
      continue
    }
    const existing = merged[key]
    if (Array.isArray(existing) && Array.isArray(value)) {
      merged[key] = [...existing, ...value]
      continue
    }
    if (isObject(existing) && isObject(value)) {
      if (isRoot && key === 'vite') {
        merged[key] = mergeViteConfig(existing, value)
      } else {
        merged[key] = mergeConfig(existing, value, false)
      }
      continue
    }
    merged[key] = value
  }
  return merged
}

function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export async function resolveSiteData(
  root: string,
  userConfig?: UserConfig,
  command: 'serve' | 'build' = 'serve',
  mode = 'development'
): Promise<SiteData> {
  userConfig = userConfig || (await resolveUserConfig(root, command, mode))[0]
  // FIXME: default theme config refactor
  const defaultThemeConfig = {
    outline: [1, 5],
    sortBy: 'CREATE_TIME',
    snippetsLength: 50,
    titleOrder: 'fileName',
    pagination: {
      prevText: 'Prev page',
      nextText: 'Next page',
      size: 10,
      pagerCount: 7,
      hideOnSinglePage: true
    }
  }
  return {
    lang: userConfig.lang || 'en-US',
    dir: userConfig.dir || 'ltr',
    rss: userConfig.rss,
    title: userConfig.title || 'UPress',
    titleTemplate: userConfig.titleTemplate,
    description: userConfig.description || 'A UPress site',
    base: userConfig.base ? userConfig.base.replace(/([^/])$/, '$1/') : '/',
    head: resolveSiteDataHead(userConfig),
    appearance: userConfig.appearance ?? true,
    themeConfig: mergeViteConfig(defaultThemeConfig, userConfig.themeConfig || {}),
    locales: userConfig.locales || {},
    scrollOffset: userConfig.scrollOffset || 90,
    cleanUrls: !!userConfig.cleanUrls
  }
}

function resolveSiteDataHead(userConfig?: UserConfig): HeadConfig[] {
  const head = userConfig?.head ?? []

  // add inline script to apply dark mode, if user enables the feature.
  // this is required to prevent "flash" on initial page load.
  if (userConfig?.appearance ?? true) {
    // if appearance mode set to light or dark, default to the defined mode
    // in case the user didn't specify a preference - otherwise, default to auto
    const fallbackPreference = userConfig?.appearance !== true ? userConfig?.appearance ?? '' : 'auto'

    head.push([
      'script',
      { id: 'check-dark-light' },
      `
        ;(() => {
          const preference = localStorage.getItem('${APPEARANCE_KEY}') || '${fallbackPreference}'
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (!preference || preference === 'auto' ? prefersDark : preference === 'dark') {
            document.documentElement.classList.add('dark')
          }
        })()
      `
    ])
  }
  // katex
  head.push([
    'link',
    {
      rel: 'stylesheet',
      href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css'
    }
  ])
  return head
}

function rewrite(src: string, from: string, to: string) {
  const urlMatch = match(from)
  const res = urlMatch(src)
  if (!res) return false
  const toPath = compile(to)
  return toPath(res.params)
}