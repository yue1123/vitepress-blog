import type {
	UserConfig as _UserConfig,
	DefaultTheme,
	MarkdownOptions as _MarkdownOptions,
	RawConfigExports
} from 'vitepress'
import type { MermaidConfig } from 'mermaid'

export interface MarkdownOptions extends _MarkdownOptions {
	/**
	 * Chart rendering configuration
	 */
	chart?: {
		/**
		 * Mermaid configuration
		 * @see https://mermaid.js.org/
		 */
		mermaid: MermaidConfig
		/**
		 * plantUML configuration
		 * @see https://plantuml.com/zh/
		 */
		plantuml: { server: string }
	}
}

export interface UserConfig<ThemeConfig> extends _UserConfig {
	markdown?: MarkdownOptions
	rss?: {
		email?: string
		host?: string
	}
	extends?: RawConfigExports<ThemeConfig>
	themeConfig?: ThemeConfig
}

export interface ThemeConfig extends DefaultTheme.Config {
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
	 * @enum[] contentTitle 文章内容标题优先
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
	[key: string]: any
}
export type Config = UserConfig<ThemeConfig>
export type PartialConfig = UserConfig<Partial<ThemeConfig>>
