import { defineConfig } from 'vitepress-blog'

export default defineConfig({
  srcDir: './',
  title: 'test demo',
  base: '/vitepress-blog/default/',
  themeConfig: {
    name: 'yue1123',
    nav: [
      { text: '首页', link: '/' },
      { text: '标签', link: '/tags' },
      { text: '归档', link: '/archives' }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/yue1123' }],
    filePathToTags: [
      {
        test: /\/notes\//,
        tag: '随笔'
      }
    ],
    sortBy: 'CREATE_TIME',
    footer: {
      copyright: 'Copyright © 2023-present yue1123'
    }
  }
})
