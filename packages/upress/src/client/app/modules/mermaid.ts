// @ts-ignore
import { customAlphabet } from 'nanoid'
import { decode } from 'js-base64'

const nanoid = customAlphabet('abcedfghicklmn', 10)
const cache = new Map<string, string>()
let mermaid: any
export async function renderMermaid(encoded: string, options: any) {
  if (!mermaid) {
    mermaid = (await import('mermaid')).default
    mermaid.startOnLoad = false
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      useWidth: 1300,
      useMaxWidth: 1300,
      gantt: {
        useWidth: 1300
      },
      ...options
    })
  }
  const key = encoded + JSON.stringify(options)
  const _cache = cache.get(key)
  if (_cache) return _cache
  const code = decode(encoded)
  const id = nanoid()
  const svg = mermaid.render(id, code) as string
  cache.set(key, svg)
  return svg
}
