export function replaceTemplate(template: string, data: Record<string, any>): string {
  Object.keys(data).forEach((key) => {
    const replacedRegexp = new RegExp(`{{\\s*(${key})\\s*}}`, 'g')

    template = template.replace(replacedRegexp, (_, key) => {
      return data[key]
    })
  })
  return template
}
