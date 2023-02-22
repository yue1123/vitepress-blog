// @ts-ignore
import mermaid from 'mermaid/dist/mermaid.esm.mjs'
import { customAlphabet } from 'nanoid'
import { decode } from 'js-base64'

mermaid.startOnLoad = false
mermaid.initialize({ startOnLoad: false })
const nanoid = customAlphabet('abcedfghicklmn', 10)
const cache = new Map<string, string>()

export function renderMermaid(encoded: string, options: any) {
  const key = encoded + JSON.stringify(options)
  const _cache = cache.get(key)
  if (_cache) return _cache
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
  const code = decode(encoded)
  const id = nanoid()
  const svg = mermaid.render(id, code) as string
  cache.set(key, svg)
  return svg
}
