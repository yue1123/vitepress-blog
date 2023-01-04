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
const node = defineConfig({
  input: './packages/node/index.ts',
  external,
  output: {
    dir: './dist/node/',
    exports: 'named',
    format: 'esm',
    preserveModules: true,
    banner: getBanner(pkg)
  },
  plugins: nodePlugins
})
const command = defineConfig({
  input: './packages/node/command.ts',
  external,
  output: {
    dir: './dist/node/',
    format: 'esm',
    banner: getBanner(pkg)
  },
  plugins: nodePlugins
})

const client = defineConfig({
  input: './packages/client/index.ts',
  external,
  output: {
    dir: './dist/client/',
    exports: 'named',
    format: 'esm',
    preserveModules: true,
    banner: getBanner(pkg)
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript(),
    copy({
      targets: [{ src: './packages/client/theme/*', dest: 'dist/client/theme' }]
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
module.exports = [
  node,
  client,
  command
]
