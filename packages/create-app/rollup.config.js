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
	(id) => {
		return id.endsWith('.json')
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

const main = defineConfig({
	input: './index.ts',
	external,
	output: [
		{
			dir: './dist/',
			format: 'cjs'
		}
	],
	plugins: nodePlugins
})

module.exports = [main]
