import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { App } from 'vue'
import type { Router } from './router.js'
import type { UPressData } from './data.js'

const COMPONENT_STATE_TYPE = 'UPress'

export const setupDevtools = (
  app: App,
  router: Router,
  data: UPressData
): void => {
  setupDevtoolsPlugin(
    {
      // fix recursive reference
      app: app as any,
      id: 'upress',
      label: 'UPress',
      packageName: 'upress',
      // homepage: 'https://upress.vuejs.org',
      componentStateTypes: [COMPONENT_STATE_TYPE]
    },
    (api) => {
      api.on.inspectComponent((payload) => {
        payload.instanceData.state.push({
          type: COMPONENT_STATE_TYPE,
          key: 'route',
          value: router.route,
          editable: false
        })

        payload.instanceData.state.push({
          type: COMPONENT_STATE_TYPE,
          key: 'data',
          value: data,
          editable: false
        })
      })
    }
  )
}
