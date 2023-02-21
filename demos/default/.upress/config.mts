import { defineConfig } from 'upress'
import type { Theme } from '@upress/theme-default/theme'

const a = defineConfig<Theme.Config>({
  theme: '@upress/theme-default',
  srcDir: './site',
  // outDir: resolve(process.cwd(), '../../build/defaultTheme'),
  // title: 'defaultTheme demo',
  base: '/vitepress-blog/defaultTheme/',
  rss: {
    host: 'localhost:5173'
  },
  // markdown: {
  //   theme: 'github-dark'
  // },
  lang: '123',
  themeConfig: {
    name: 'yue1123',
    filePathToTags: [
      {
        test: /\/notes\//,
        tag: '随笔'
      }
    ],
    sortBy: 'RANDOM',
    titleOrder: 'contentTitle',
    nav: [
      { text: '首页', link: '/' },
      { text: '标签', link: '/tags' },
      { text: '归档', link: '/archives' }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/yue1123' }],
    footer: {
      copyright: 'Copyright © 2023-present yue1123'
    }
  }
})

// console.log(a)
export default a
