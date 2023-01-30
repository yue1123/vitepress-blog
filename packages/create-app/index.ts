import { cyan, blue, yellow, bold, dim, red } from 'chalk'
import { version } from './package.json'
import { existsSync, mkdirSync, readdirSync, rmdirSync, promises as fs } from 'fs'
import { resolve, join, relative, basename } from 'path'
import { Command } from 'commander'
import prompts from 'prompts'
import {
	getOfficialThemeChoices,
	emptyDir,
	checkUserInputTheme,
	packageNameRegExp,
	getSuggestedPackageName
} from './utils'
import execa from 'execa'

const cwd = process.cwd()

const renameFiles = {
	_gitignore: '.gitignore',
	_npmrc: '.npmrc'
}

let tempDir: string = ''
const rmTempDir = () => {
	try {
		tempDir && rmdirSync(tempDir)
	} catch {}
}
const commonCancelTips = {
	onCancel() {
		rmTempDir()
		console.error(red('✘ Cancel creation.'))
	}
}

async function main() {
	console.log()
	console.log(`${cyan('┬  ┌┬┌─┌─┬─┌─┌─┌─┐')} ${yellow('┌┐┬ ┌─┌─┐')}`)
	console.log(`${cyan('└┐┌││├┤├─├┬├┤└─└──')}-${yellow('├┴│ │ │ ┬')}`)
	console.log(`${cyan(' └┘┴┴└─┴ ┴└└─└─└─┘')} ${yellow('└─┴─└─└─┘')}`)
	console.log()
	console.log(`${bold('  Vitepress blog') + dim(' Creator')}  ${blue(`v${version}`)}`)
	console.log()

	const program = new Command()

	program.arguments('[targetDir]').action(async (targetDir: string) => {
		let isValid = packageNameRegExp.test(basename(targetDir || '') || '')
		if (!targetDir || !isValid) {
			const { projectName } = await prompts(
				{
					type: 'text',
					name: 'projectName',
					message: 'Project name:',
					initial: 'vitepress-blog',
					validate(value) {
						return packageNameRegExp.test(value)
							? true
							: `Invalid project name. Suggested name: ${getSuggestedPackageName(
									value
							  )}`
					}
				},
				commonCancelTips
			)
			if (!projectName) return
			targetDir = projectName.trim()
		}

		const root = join(cwd, targetDir)

		if (!existsSync(root)) {
			mkdirSync(root, { recursive: true })
		} else {
			const existing = readdirSync(root)
			if (existing.length) {
				console.log(yellow(`  Target directory "${targetDir}" is not empty.`))
				/**
				 * @type {{ yes: boolean }}
				 */
				const { yes } = await prompts({
					type: 'confirm',
					name: 'yes',
					initial: 'Y',
					message: 'Remove existing files and continue?'
				})
				if (yes) emptyDir(root)
				else return
			}
		}
		tempDir = targetDir
		console.log(dim('  Scaffolding project in ') + targetDir + dim(' ...'))
		console.log()

		const templateDir = join(__dirname, 'template')
		const pkgManager =
			/pnpm/.test(process.env.npm_execpath || '') ||
			/pnpm/.test(process.env.npm_config_user_agent || '')
				? 'pnpm'
				: /yarn/.test(process.env.npm_execpath || '')
				? 'yarn'
				: 'npm'
		const related = relative(cwd, root)
		const { lang, theme, name } = await prompts(
			[
				{
					type: 'text',
					name: 'title',
					message: "What's your blog title ?"
				},
				{
					type: 'text',
					name: 'name',
					message: "What's your github name ?"
				},
				{
					type: 'select',
					name: 'theme',
					message: 'Pick blog theme',
					choices: [
						...getOfficialThemeChoices(),
						{
							title: 'use community themes',
							value: 'community'
						}
					]
				},
				{
					type: (prev) => (prev == 'community' ? 'text' : null),
					name: 'theme',
					message: 'Community theme package name',
					async validate(value) {
						try {
							return await checkUserInputTheme(value)
						} catch (error) {
							return error
						}
					}
				},
				{
					type: 'select',
					name: 'lang',
					message: 'Pick language of configuration file',
					choices: [
						{ title: 'JavaScript', value: 'mjs' },
						{ title: 'TypeScript', value: 'mts' }
					]
				}
			],
			commonCancelTips
		)
		// TODO: copy template
		// TODO: rename  package.json name
	})
	program.parse()
}

main().catch((e) => {
	rmTempDir()
	console.error(e)
})
