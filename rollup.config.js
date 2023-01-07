const { defineConfig } = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const typescript = require('rollup-plugin-typescript')
const copy = require('rollup-plugin-copy')
const { builtinModules } = require('module')
const json = require('@rollup/plugin-json')
const replace = require('@rollup/plugin-replace')
const pkg = require('./package.json')
const { dependencies, version } = pkg
const external = [
  'vite',
  'vitepress/theme',
  ...Object.keys(dependencies),
  ...builtinModules.flatMap((m) => (m.includes('punycode') ? [] : [m, `node:${m}`]))
]
const nodePlugins = [
  nodeResolve({ preferBuiltins: true }),
  typescript(),
  json(),
  replace({
    values: {
      __VERSION__: version
    },
    preventAssignment: true
  })
]
const main = defineConfig({
  input: './packages/main/index.ts',
  external,
  output: {
    dir: './dist/main/',
    exports: 'named',
    format: 'esm',
    preserveModules: true,
    banner: getBanner(pkg)
  },
  plugins: nodePlugins
})
const command = defineConfig({
  input: './packages/main/command.ts',
  external,
  output: {
    dir: './dist/main/',
    format: 'esm',
    banner: getBanner(pkg)
  },
  plugins: nodePlugins
})

const themeHelper = defineConfig({
  input: './packages/themeHelper/index.ts',
  external,
  output: {
    dir: './dist/themeHelper/',
    exports: 'named',
    format: 'esm',
    preserveModules: true,
    banner: getBanner(pkg)
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript(),
    // copy .d.ts
    copy({
      targets: [
        {
          src: './dist/themeHelper/index.d.ts',
          dest: './',
          rename: 'theme-helper.d.ts',
          transform: (contents) => contents.toString().replace(/\.\//g, './dist/themeHelper/')
        },
        {
          src: './dist/theme/index.d.ts',
          dest: './',
          rename: 'theme.d.ts',
          transform: (contents) => contents.toString().replace(/\.\//g, './dist/theme/')
        }
      ]
    }),
    // copy theme
    copy({
      targets: [{ src: './packages/theme/*', dest: 'dist/theme' }]
    }),
    json()
  ]
})

function getBanner(pkg) {
  return `
/*! 
 * ${pkg.name} v${pkg.version}
 * (c) ${pkg.author}
 * Homepage: ${pkg.homepage || null}
 * Released under the ${pkg.license} License.
 */`.trim()
}
module.exports = [main, themeHelper, command]
