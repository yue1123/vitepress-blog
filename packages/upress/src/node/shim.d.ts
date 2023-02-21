declare module 'markdown-it-footnote'
declare module 'markdown-it-sub'
declare module 'markdown-it-sup'
declare module 'markdown-it-task-lists'
declare module 'markdown-it-katex'
declare module 'markdown-it-image-lazy-loading'

declare const __VERSION__: string
declare module '*.json' {
  const type: Record<string, any>
  export default type
}

declare interface Window {
  [key: string]: any
}