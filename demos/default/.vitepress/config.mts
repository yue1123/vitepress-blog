import { resolve } from 'path'
import { defineConfig } from 'vitepress-blog'

const a = defineConfig({
	srcDir: './site',
	outDir: resolve(process.cwd(), '../../build/defaultTheme'),
	title: 'defaultTheme demo',
	base: '/vitepress-blog/defaultTheme/',
	rss: {
		host: 'localhost:5173'
	},
	markdown: {
		theme: 'github-dark'
	},
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
		sortBy: 'UPDATE_TIME',
		titleOrder: 'contentTitle',
		footer: {
			copyright: 'Copyright © 2023-present yue1123'
		}
	}
})

// console.log(a)
export default a
