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
import copy from 'rollup-plugin-copy'

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

const cleanUp = (path: string) => {
  return {
    name: 'cleanup',
    async closeBundle() {
      if (PROD) {
        await fs.rm(r(path), { recursive: true })
      }
    }
  }
}

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
    chunkFileNames: 'serve-[hash].js',
    dir: r('dist/node')
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}

const shared: RollupOptions = {
  input: r('src/shared/shared.ts'),
  output: {
    format: 'esm',
    exports: 'named',
    preserveModules: true,
    dir: r('dist/shared')
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
    chunkFileNames: 'serve-[hash].cjs'
  },
  external,
  plugins,
  onwarn(warning, warn) {
    if (warning.code !== 'EVAL') warn(warning)
  }
}

const config = defineConfig([])

config.push(esmBuild)
config.push(shared)

if (PROD) {
  config.push(cjsBuild)
}

config.push({
  input: r('dist/temp-types/client/index.d.ts'),
  output: {
    format: 'esm',
    file: 'dist/client/index.d.ts'
  },
  external,
  plugins: [
    dts({ respectExternal: true }),
    copy({
      targets: [
        {
          src: 'src/client/app/components/*.vue',
          dest: './dist/client/app/components'
        }
      ]
    })
  ]
})

config.push({
  input: r('dist/temp-types/node/index.d.ts'),
  output: {
    format: 'esm',
    file: 'dist/node/index.d.ts'
  },
  external,
  plugins: [dts({ respectExternal: true })]
})

export default config
