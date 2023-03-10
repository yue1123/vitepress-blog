const { resolve } = require('path')
const { defineConfig } = require('rollup')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const esbuild = require('rollup-plugin-esbuild').default
const copy = require('rollup-plugin-copy')
const { builtinModules } = require('module')
const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')

const pkg = require('./package.json')

const { dependencies, version } = pkg
const root = process.cwd()

const external = [
  'vite',
  'vitepress/theme',
  /\.vue$/,
  (id) => {
    return id.endsWith('.vue')
  },
  ...Object.keys(dependencies),
  ...builtinModules.flatMap((m) => (m.includes('punycode') ? [] : [m, `node:${m}`]))
]

const nodePlugins = [
  nodeResolve({ preferBuiltins: true }),
  esbuild({
    define: {
      __VERSION__: `"${version}"`
    }
  }),
  commonjs(),
  json()
]

const vitepressBlogExport = [resolve(root, './packages/index.ts'), resolve(root, './packages/theme-helper.ts')]
const vitepressBlog = defineConfig({
  input: vitepressBlogExport,
  external(id) {
    if (vitepressBlogExport.indexOf(id) !== -1) {
      return false
    }
    return true
  },
  output: [
    {
      dir: './dist/',
      exports: 'named',
      format: 'esm'
    }
  ],
  plugins: [
    (function replace() {
      return {
        transform(code) {
          const reg = /@vitepress-blog\/([\w\-]*)/
          if (reg.test(code)) {
            return code.replace(reg, (_, a) => {
              return `./${a}/index`
            })
          }
        }
      }
    })(),
    ...nodePlugins
  ]
})

const main = defineConfig({
  input: './packages/main/index.ts',
  external,
  output: [
    {
      dir: './dist/main/',
      exports: 'named',
      format: 'esm',
      preserveModules: true,
      banner: getBanner(pkg)
    }
  ],
  plugins: nodePlugins
})

// const command = defineConfig({
//   input: './packages/cli/command.ts',
//   external,
//   output: {
//     dir: './dist/cli/',
//     format: 'esm',
//     banner: getBanner(pkg)
//   },
//   plugins: nodePlugins
// })

const themeHelper = defineConfig({
  input: './packages/theme-helper/index.ts',
  external,
  output: [
    {
      dir: './dist/theme-helper/',
      exports: 'named',
      format: 'esm',
      preserveModules: true,
      banner: getBanner(pkg)
    },
    process.env.NODE_ENV === 'production'
      ? {
          dir: './packages/theme-helper/dist',
          exports: 'named',
          format: 'esm',
          preserveModules: true,
          banner: getBanner(pkg)
        }
      : null
  ],
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    esbuild(),
    // copy .d.ts
    copy({
      targets: [
        {
          src: './dist/theme-helper/index.d.ts',
          dest: './',
          rename: 'theme-helper.d.ts',
          transform: (contents) => contents.toString().replace(/\.\//g, './dist/themeHelper/')
        }
      ]
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
module.exports = [main, themeHelper, 
  // command,
   vitepressBlog]
