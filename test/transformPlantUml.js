const str = `# ceshi123



  \`\`\`plantuml {scale: 0.5}
  @startuml
  !theme plain
  Bob -> Alice :  hello
  Bob <- Alice :  $success("success: hello B.")
  Bob -x Alice :  $failure("failure")
  Bob ->> Alice : $warning("warning")
  @enduml
  \`\`\`

\`\`\`plantuml {theme: 'neutral', scale: 0.8}
@startuml
!theme plain
Bob -> Alice :  hello
Bob <- Alice :  $success("success: hello B.")
Bob -x Alice :  $failure("failure")
Bob ->> Alice : $warning("warning")
@enduml
\`\`\`
`

const reg = /^```plantuml\s*?({.*?})?\n([\s\S]+?)\n```/gm

// console.log(str.match(reg))

export function transformPlantUml(md, server) {
	console.log('jiexi')
	return md.replace(
		/^```plantuml\s*?({.*?})?\n([\s\S]+?)\n```/gm,
		(_, options = '', content = '') => {
			console.log('=====================\n')
			console.log(options, content)
			console.log('=====================\n')
			const code = content.trim()
			options = options.trim() || '{}'
			return `<PlantUML :code="'${code}'" :server="'${server}'" v-bind="${options}" />`
		}
	)
}

console.log(transformPlantUml(str, ''))
