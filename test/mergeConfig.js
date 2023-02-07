const { mergeConfig } = require('vite')

const defaults = {
  chart: {
    mermaid: {
      theme: 'dark'
    },
    plantuml: {
      server: 'https://www.plantuml.com/plantuml'
    }
  }
}

const overrides = {
  chart: {
    mermaid: {
      theme: 'dark123123'
    }
  }
}
console.log(mergeConfig(defaults, undefined))
