import { EnhanceAppContext } from 'vitepress'
import Mermaid from './components/Mermaid.vue'
import PlantUML from './components/PlantUML.vue'

export function setup({ app }: EnhanceAppContext) {
  // FIXME: resize 重新计算 scale
  // TODO: 组件细节待优化
  app.component('Mermaid', Mermaid)
  app.component('PlantUML', PlantUML)
}
