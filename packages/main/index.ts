import { resolve } from 'path'
import deepmerge from 'deepmerge'
import { Config } from '@vitepress-blog/types'
import markdownContent from './plugins/markdown-content'
import generateRss from './plugins/generate-rss'
import { expandMarkdownIt } from './plugins/expand-markdown-it'

const combineDefaultConfig = (userConfig: Config) => {
	let mergedConfig: Config
	const configResolver = () => mergedConfig
	const defaultConfig = {
    srcDir: './site',
    cacheDir: resolve(process.cwd(), './node_modules/.vitepress'),
    tempDir: resolve(process.cwd(), './node_modules/.vitepress/temp'),
    markdown: {
      config: (md: any) => expandMarkdownIt(md),
      chart: {
        mermaid: {
          theme: 'dark'
        },
        plantuml: {
          server: 'https://www.plantuml.com/plantuml'
        }
      }
    },
    vite: { plugins: [markdownContent(configResolver), generateRss(configResolver)] },
    themeConfig: {
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
    },
    head: [
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css'
        }
      ]
    ]
  }
	mergedConfig = deepmerge(defaultConfig, userConfig)
	return mergedConfig
}

function defineConfig(config: Config): Config {
	return combineDefaultConfig(config)
}

export { defineConfig }
