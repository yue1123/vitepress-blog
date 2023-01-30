type State = {
	code: string
	link: string
	frontmatter: string
}
export const sharedState = new Map<string, State>()
