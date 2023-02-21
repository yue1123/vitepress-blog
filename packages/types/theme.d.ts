declare const theme: {
  Layout: DefineComponent
  NotFound: DefineComponent
  enhanceApp: (ctx: EnhanceAppContext) => void
}
export type ThemeMetaConfig = Record<'name' | 'description' | 'previewLink' | 'pages', any>
