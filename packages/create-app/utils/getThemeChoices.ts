import officialThemes from '../officialThemes'

export function getOfficialThemeChoices() {
	return Object.keys(officialThemes).map((key) => {
		return {
			title: key,
			value: officialThemes[key]
		}
	})
}
