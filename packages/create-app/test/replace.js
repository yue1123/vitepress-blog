let str = `import { defineConfig } from 'vitepress-blog'

export default defineConfig({
  title: '{{title}}',
  themeConfig: {
    name: '{{name}}',
    nav: {{nav}},
    socialLinks: [
      { icon: 'github', link: 'https://github.com/{{name}}' },
    ],
    filePathToTags: [
      {
        test: /\\/notes\\//,
        tag: '随笔'
      }
    ],
    sortBy: 'CREATE_TIME',
    footer: {
      copyright: 'Copyright © 2023-present {{name}}'
    }
  }
})`

const data = {
  title: '12312',
  name: '张三',
  nav: `[{ text: '首页', link: '/' }, { text: '标签', link: '/tags' }, { text: '归档', link: '/archives' }]`
}

Object.keys(data).forEach((key) => {
  console.log(key)
  const replacedRegexp = new RegExp(`{{\\s*(${key})\\s*}}`, 'g')
  console.log(replacedRegexp)

  str = str.replace(replacedRegexp, (_, key) => {
    return data[key]
  })
})
console.log(str)
