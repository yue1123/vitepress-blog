import fg from 'fast-glob'
import chalk from 'chalk'
import { resolve } from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

export default function themeResolver(root: string) {
  const themeConfigs = fg.sync(['node_modules/@vitepress-blog-theme/**/config.json'], { deep: 2 })
  if (!themeConfigs || (themeConfigs && !themeConfigs.length)) {
    return console.log(
      chalk.red(
        `You haven't installed any vitepress-blog theme yet, visit https://www.npmjs.com/search?q=%40vitepress-blog-theme and choose your favorite theme to install, then try again`
      )
    )
  }
  return themeConfigs.map((item) => {
    return require(resolve(root, item))
  }) as Record<'name' | 'description' | 'previewLink' | 'pages', any>[]
}
