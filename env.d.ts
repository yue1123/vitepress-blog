/// <reference types="vite/client" />

declare module 'markdown-it-footnote'
declare module 'markdown-it-sub'
declare module 'markdown-it-sup'
declare module 'markdown-it-task-lists'
declare module 'markdown-it-katex'
declare module 'markdown-it-image-lazy-loading'
declare module 'markdown-it-textual-uml'
// declare module 'prompts'
declare module 'cross-spawn'

declare const __VERSION__: string
declare module '*.json' {
  const type: Record<any, any>
  export default type
}

declare interface Window {
  [key: string]: any
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
