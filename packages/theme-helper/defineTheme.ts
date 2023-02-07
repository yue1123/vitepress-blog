import defaultTheme from 'penpress/theme'
import type { Theme } from 'penpress'
// import { EnhanceAppContext } from 'penpress'
import { setup } from './builtin/setup'

function combineThemeConfig(userThemeConfig: Theme) {
  return {
    ...defaultTheme,
    ...userThemeConfig,
    enhanceApp: (ctx: any) => {
      setup(ctx)
      defaultTheme.enhanceApp(ctx)
      userThemeConfig.enhanceApp && userThemeConfig.enhanceApp(ctx)
    }
  }
}

export function defineTheme(themeConfig: Theme): Theme {
  return combineThemeConfig(themeConfig)
}
