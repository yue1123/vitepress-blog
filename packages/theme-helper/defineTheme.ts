import defaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { EnhanceAppContext } from 'vitepress'
import { setup } from './builtin/setup'

function combineThemeConfig(userThemeConfig: Theme) {
  return {
    ...defaultTheme,
    ...userThemeConfig,
    enhanceApp: (ctx: EnhanceAppContext) => {
      setup(ctx)
      defaultTheme.enhanceApp(ctx)
      userThemeConfig.enhanceApp && userThemeConfig.enhanceApp(ctx)
    }
  }
}

export function defineTheme(themeConfig: Theme): Theme {
  return combineThemeConfig(themeConfig)
}
