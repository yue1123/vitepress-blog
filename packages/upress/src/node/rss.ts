import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { Feed } from 'feed'
import type { Plugin, ResolvedConfig } from 'vite'
import type { FeedOptions, Item } from 'feed'
import { sharedState } from './state/shared'
// import { syncRequest } from '../utils/index'
import type { SiteConfig } from './config'

export default function generateRss(userConfig: SiteConfig): Plugin {
  let rssCache = new Map<string, string>()
  let config: ResolvedConfig
  return {
    name: 'generate-rss',
    enforce: 'post',
    // development rss.xml generate
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const { url } = req
          if (url === '/rss.xml' || url === '/rss.json') {
            const fnKeyMap: Record<string, 'rss2' | 'json1' | 'atom1'> = {
              '/rss.xml': 'rss2',
              '/rss.json': 'json1'
            }
            res.statusCode = 200
            res.setHeader(
              'Content-Type',
              `application/${path.extname(url).replace('.', '')}`
            )
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
      if (config.command === 'build') {
        const feed = await generateFeed(userConfig)
        writeFeed(userConfig.outDir || path.resolve('./.upress/dist/'), feed)
      }
    }
  }
}

async function generateFeed(userConfig: SiteConfig): Promise<Feed> {
  const site = userConfig.site
  const AUTHOR = {
    name: site.title || site.themeConfig?.siteTitle || '',
    email: site.rss?.email || '',
    link: site.rss?.host || ''
  }
  const favicon = `${AUTHOR.link}/${site.themeConfig?.logo || 'favicon.ico'}`
  const OPTIONS: FeedOptions = {
    title: AUTHOR.name,
    description: site.description || '',
    id: `${AUTHOR.link}/`,
    link: `${AUTHOR.link}/`,
    copyright: site.themeConfig?.name || '',
    feedLinks: {
      json: AUTHOR.link + '/rss.json',
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
        const url: string = link.slice(
          link.search(/(\\|\/)posts(\\|\/).+\.md$/)
        )
        return {
          ...res.data,
          title,
          date: new Date(+createTime),
          content: code,
          author: [AUTHOR],
          link: `${AUTHOR.link}${site.base}${getPostLink(
            url,
            site.cleanUrls || false
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

function getPostLink(url: string, cleanUrl: boolean) {
  let replaced = ''
  if (cleanUrl) {
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
