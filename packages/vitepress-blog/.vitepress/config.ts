import { defineConfig } from 'vitepress-blog'

export default defineConfig({
  title: 'fasd',
  themeConfig: {
    name: 'asdf',
    nav: [],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/asdf' },
    ],
    filePathToTags: [
      {
        test: /\/notes\\/,
        tag: '随笔'
      }
    ],
    sortBy: 'CREATE_TIME',
    footer: {
      copyright: 'Copyright © 2023-present asdf'
    }
  }
})