// export interface ThemeConfig
import { ThemeConfig as VitepressThemeConfig } from '@upress/theme-vitepress/theme'

export declare namespace Theme {
  export type Config = Omit<VitepressThemeConfig, 'sidebar'>
}
