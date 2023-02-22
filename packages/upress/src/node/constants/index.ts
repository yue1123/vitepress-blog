export const frontmatterReg = /---[\w\W]*?---/im
export const imgReg = /\!\[.+\]\(.+\)/g
export const linkReg = /\[.+\]\(.+\)/g
export const mdFrontmatter = /\{\{\s+\$frontmatter\s+\}\}/g
export const snippetsReg = /[\w\u4e00-\u9fa5\,\.\!\，\。\！\"\"\'\'\‘\’\“\”\:\：]+/g
export const containerReg = /\:\:\:.*\n.*\n*\:\:\:/g
export const codeContainerReg = /```\w*\n[\w\W]*?\n```/g
export const mermaidCodeContainerReg = /^```mermaid\s*?({.*?})?\n([\s\S]+?)\n```/gm
export const plantUmlCodeContainerReg = /^```plantuml\s*?({.*?})?\n([\s\S]+?)\n```/gm