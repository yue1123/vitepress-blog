import { type App, createApp as createClientApp, createSSRApp, defineComponent, h, onMounted, watchEffect } from 'vue'

import { inBrowser, pathToFile } from './utils'
import { type Router, RouterSymbol, createRouter } from './router'
import { siteDataRef, useData, dataSymbol, initData } from './data'
// user theme
import Theme from '@theme/index'
// hooks
import { useCodeGroups, useUpdateHead, usePrefetch, useCopyCode } from './composables/index'

// built in components
import { Content } from './components/Content'
import { ClientOnly } from './components/ClientOnly'
import Mermaid from './components/Mermaid.vue'
import PlantUML from './components/PlantUML.vue'

const NotFound = Theme.NotFound || (() => '404 Not Found')
// const Layout = Theme.Layout || (() => '404 Not Found')

const VitePressApp = defineComponent({
  name: 'VitePressApp',
  setup() {
    const { site } = useData()

    // change the language on the HTML element based on the current lang
    onMounted(() => {
      watchEffect(() => {
        document.documentElement.lang = site.value.lang
        document.documentElement.dir = site.value.dir
      })
    })

    if (import.meta.env.PROD) {
      // in prod mode, enable intersectionObserver based pre-fetch
      usePrefetch()
    }

    // setup global copy code handler
    useCopyCode()
    // setup global code groups handler
    useCodeGroups()

    if (Theme.setup) Theme.setup()
    // FIXME: default Layout
    return () => h(Theme.Layout)
  }
})

export async function createApp() {
  const router = newRouter()

  const app = newApp()

  app.provide(RouterSymbol, router)

  const data = initData(router.route)
  app.provide(dataSymbol, data)

  // provide this to avoid circular dependency in VPContent
  app.provide('NotFound', NotFound)

  // install global components
  app.component('Content', Content)
  app.component('ClientOnly', ClientOnly)
  app.component('Mermaid', Mermaid)
  app.component('PlantUML', PlantUML)
  // expose $frontmatter
  Object.defineProperty(app.config.globalProperties, '$frontmatter', {
    get() {
      return data.frontmatter.value
    }
  })

  // user theme
  if (Theme.enhanceApp) {
    await Theme.enhanceApp({
      app,
      router,
      siteData: siteDataRef
    })
  }

  // setup devtools in dev mode
  if (import.meta.env.DEV || __VUE_PROD_DEVTOOLS__) {
    import('./devtools.js').then(({ setupDevtools }) => setupDevtools(app, router, data))
  }

  return { app, router, data }
}

function newApp(): App {
  return import.meta.env.PROD ? createSSRApp(VitePressApp) : createClientApp(VitePressApp)
}

function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)

    if (isInitialPageLoad) {
      initialPath = pageFilePath
    }

    // use lean build if this is the initial page load or navigating back
    // to the initial loaded path (the static vnodes already adopted the
    // static content on that load so no need to re-fetch the page)
    if (isInitialPageLoad || initialPath === pageFilePath) {
      pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
    }

    if (inBrowser) {
      isInitialPageLoad = false
    }

    return import(/*@vite-ignore*/ pageFilePath)
  }, NotFound)
}

if (inBrowser) {
  createApp().then(({ app, router, data }) => {
    // wait until page component is fetched before mounting
    router.go().then(() => {
      // dynamically update head tags
      useUpdateHead(router.route, data.site)
      app.mount('#app')
    })
  })
}
