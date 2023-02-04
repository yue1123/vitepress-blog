import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { Feed } from 'feed'
import type { Plugin } from 'vite'
import type { Config } from '@vitepress-blog/types'
import type { FeedOptions, Item } from 'feed'
import { sharedState } from '../state/shared'
// import { syncRequest } from '../utils/index'

export default function generateRss(userConfigResolver: () => Config): Plugin {
	let userConfig: Config
	let rssCache = new Map<string, string>()

	return {
    name: 'generate-rss',
    enforce: 'post',
    configResolved() {
      userConfig = userConfigResolver()
    },
    // development rss.xml generate
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const { url } = req
          if (url === '/rss.xml' || url === '/rss.json' || url === '/rss.atom') {
            const fnKeyMap: Record<string, 'rss2' | 'json1' | 'atom1'> = {
              '/rss.xml': 'rss2',
              '/rss.json': 'json1'
              // '/rss.atom': 'atom1'
            }
            res.statusCode = 200
            res.setHeader('Content-Type', `application/${path.extname(url).replace('.', '')}`)
            let resData: string | void = rssCache.get(url)
            if (!resData) {
              const feed = await generateFeed(userConfig)
              Object.entries(fnKeyMap).forEach(([_url, fnKey]) => {
                const data = feed[fnKey]()
                sharedState.size && rssCache.set(_url, data)
                _url === url && (resData = data)
              })
            }
            res.write(resData)
            res.end()
          } else {
            next()
          }
        })
      }
    },
    // production rss.xml generate
    async buildEnd() {
      const feed = await generateFeed(userConfig)
      writeFeed(userConfig.outDir || path.resolve('./.vitepress/dist/'), feed)
    }
  }
}

async function generateFeed(userConfig: Config): Promise<Feed> {
	const AUTHOR = {
		name: userConfig.title || userConfig.themeConfig?.siteTitle || '',
		email: userConfig.rss?.email || '',
		link: userConfig.rss?.host || ''
	}
	const favicon = `${AUTHOR.link}/${userConfig.themeConfig?.logo || 'favicon.ico'}`
	const OPTIONS: FeedOptions = {
		title: AUTHOR.name,
		description: userConfig.description || '',
		id: `${AUTHOR.link}/`,
		link: `${AUTHOR.link}/`,
		copyright: userConfig.themeConfig?.name || '',
		feedLinks: {
			json: AUTHOR.link + '/rss.json',
			// atom: AUTHOR.link + '/rss.atom',
			rss: AUTHOR.link + '/rss.xml'
		},
		author: AUTHOR,
		image: favicon,
		favicon
	}
	const posts: any[] = (
		await Promise.all(
			[...sharedState.values()].map(async ({ code, frontmatter, link }) => {
				const res: any = matter(frontmatter)

				const { createTime, title } = res.data
				const url: string = link.slice(link.search(/(\\|\/)posts(\\|\/).+\.md$/))
				return {
					...res.data,
					title,
					date: new Date(+createTime),
					content: code,
					author: [AUTHOR],
					link: `${AUTHOR.link}${userConfig.base}${getPostLink(
						url,
						userConfig.cleanUrls || 'disabled'
					)}`.replace(/\/+/g, '/')
				} as Item
			})
		)
	).filter(Boolean)

	// posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))
	// return posts
	const feed = new Feed(OPTIONS)
	posts.forEach((item) => feed.addItem(item))
	return feed
}

function getPostLink(url: string, urlMode: 'disabled' | 'without-subfolders' | 'with-subfolders') {
	let replaced = ''
	if (urlMode === 'disabled') {
		replaced = '.html'
	}
	return url.replace('.md', replaced)
}

async function fsExists(path: string) {
	try {
		await fs.access(path, 0)
	} catch (e) {
		return false
	}
	return true
}

async function writeFeed(outputDir: string, feed: Feed) {
	if (!(await fsExists(outputDir))) {
		await fs.mkdir(outputDir, { recursive: true })
	}
	await fs.writeFile(`${outputDir}/rss.xml`, feed.rss2(), 'utf-8')
	await fs.writeFile(`${outputDir}/rss.json`, feed.json1(), 'utf-8')
}
