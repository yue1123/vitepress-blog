// const { resolve } = require('path')
// const { defineConfig } = require('rollup')
// const { nodeResolve } = require('@rollup/plugin-node-resolve')
// const esbuild = require('rollup-plugin-esbuild').default
// const copy = require('rollup-plugin-copy')
// const { builtinModules } = require('module')
// const json = require('@rollup/plugin-json')
// const commonjs = require('@rollup/plugin-commonjs')

// const pkg = require('./package.json')

// const { dependencies, version } = pkg
// const root = process.cwd()

// const external = [
//   'vite',
//   'vitepress/theme',
//   /\.vue$/,
//   (id) => {
//     return id.endsWith('.vue')
//   },
//   ...Object.keys(dependencies),
//   ...builtinModules.flatMap((m) => (m.includes('punycode') ? [] : [m, `node:${m}`]))
// ]

// const nodePlugins = [
//   nodeResolve({ preferBuiltins: true }),
//   esbuild({
//     define: {
//       __VERSION__: `"${version}"`
//     }
//   }),
//   commonjs(),
//   json()
// ]

// const vitepressBlogExport = [resolve(root, './packages/index.ts'), resolve(root, './packages/theme-helper.ts')]
// const vitepressBlog = defineConfig({
//   input: vitepressBlogExport,
//   external(id) {
//     if (vitepressBlogExport.indexOf(id) !== -1) {
//       return false
//     }
//     return true
//   },
//   output: [
//     {
//       dir: './dist/',
//       exports: 'named',
//       format: 'esm'
//     }
//   ],
//   plugins: [
//     (function replace() {
//       return {
//         transform(code) {
//           const reg = /@penpress\/([\w\-]*)/
//           if (reg.test(code)) {
//             return code.replace(reg, (_, a) => {
//               return `./${a}/index`
//             })
//           }
//         }
//       }
//     })(),
//     ...nodePlugins
//   ]
// })

// const main = defineConfig({
//   input: './packages/main/index.ts',
//   external,
//   output: [
//     {
//       dir: './dist/main/',
//       exports: 'named',
//       format: 'cjs',
//       preserveModules: true,
//       banner: getBanner(pkg)
//     }
//   ],
//   plugins: nodePlugins
// })

// // const command = defineConfig({
// //   input: './packages/cli/command.ts',
// //   external,
// //   output: {
// //     dir: './dist/cli/',
// //     format: 'esm',
// //     banner: getBanner(pkg)
// //   },
// //   plugins: nodePlugins
// // })

// const themeHelper = defineConfig({
//   input: './packages/theme-helper/index.ts',
//   external,
//   output: [
//     {
//       dir: './dist/theme-helper/',
//       exports: 'named',
//       format: 'esm',
//       preserveModules: true,
//       banner: getBanner(pkg)
//     },
//     process.env.NODE_ENV === 'production'
//       ? {
//           dir: './packages/theme-helper/dist',
//           exports: 'named',
//           format: 'esm',
//           preserveModules: true,
//           banner: getBanner(pkg)
//         }
//       : null
//   ],
//   plugins: [
//     nodeResolve({ preferBuiltins: true }),
//     esbuild(),
//     // copy .d.ts
//     copy({
//       targets: [
//         {
//           src: './dist/theme-helper/index.d.ts',
//           dest: './',
//           rename: 'theme-helper.d.ts',
//           transform: (contents) => contents.toString().replace(/\.\//g, './dist/themeHelper/')
//         }
//       ]
//     }),
//     json()
//   ]
// })

// function getBanner(pkg) {
//   return `
// /*!
//  * ${pkg.name} v${pkg.version}
//  * (c) ${pkg.author}
//  * Homepage: ${pkg.homepage || null}
//  * Released under the ${pkg.license} License.
//  */`.trim()
// }
// module.exports = [main, themeHelper,
//   // command,
//    vitepressBlog]

import { promises as fs } from 'fs'
import { builtinModules, createRequire } from 'module'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { type RollupOptions, defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import dts from 'rollup-plugin-dts'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const DEV = !!process.env.DEV
const PROD = !DEV

const ROOT = fileURLToPath(import.meta.url)
const r = (p: string) => resolve(ROOT, '..', p)

const external = [
  ...Object.keys(pkg.dependencies),
  ...builtinModules.flatMap((m) => (m.includes('punycode') ? [] : [m, `node:${m}`])),
  r('types/shared.d.ts')
]

const plugins = [
  alias({
    entries: {
      'readable-stream': 'stream'
    }
  }),
  replace({
    // polyfill broken browser check from bundled deps
    'navigator.userAgentData': 'undefined',
    'navigator.userAgent': 'undefined',
    preventAssignment: true
  }),
  commonjs(),
  nodeResolve({ preferBuiltins: false }),
  esbuild({ target: 'node14' }),
  json()
]

const esmBuild: RollupOptions = {
  input: [r('src/node/index.ts'), r('src/node/cli.ts')],
  output: {
    format: 'esm',
    entryFileNames: `[name].js`,
    chunkFileNames: DEV ? 'serve.js' : 'serve-[hash].js',
    dir: r('dist/node')
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}
const cjsBuild: RollupOptions = {
  input: [r('src/node/index.ts'), r('src/node/cli.ts')],
  output: {
    format: 'cjs',
    dir: r('dist/node-cjs'),
    entryFileNames: `[name].cjs`,
    chunkFileNames: DEV ? 'serve.cjs' : 'serve-[hash].cjs'
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}

const nodeTypes: RollupOptions = {
  input: r('src/node/index.ts'),
  output: {
    format: 'esm',
    file: 'dist/node/index.d.ts'
  },
  external,
  plugins: [dts({ respectExternal: true })]
}

const clientTypes: RollupOptions = {
  // input: r('dist/client-types/index.d.ts'),
  input: r('src/client/index.ts'),
  output: {
    format: 'esm',
    file: 'dist/client/index.d.ts'
  },
  external,
  plugins: [
    dts({ respectExternal: true })
    // {
    //   name: 'cleanup',
    //   async closeBundle() {
    //     if (PROD) {
    //       await fs.rm(r('dist/client-types'), { recursive: true })
    //     }
    //   }
    // }
  ]
}

const config = defineConfig([])

// config.push(esmBuild)

// if (PROD) {
//   config.push(cjsBuild)
// }

// config.push(nodeTypes)
config.push(clientTypes)

export default config
