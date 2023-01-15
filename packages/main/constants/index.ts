export const frontmatterReg = /^---(\n.+)*\n*---/
export const imgReg = /\!\[.+\]\(.+\)/g
export const linkReg = /\[.+\]\(.+\)/g
export const mdFrontmatter = /\{\{\s+\$frontmatter\s+\}\}/g
export const snippetsReg = /[\w\u4e00-\u9fa5\,\.\!\，\。\！\"\"\'\'\‘\’\“\”\:\：]+/g
export const containerReg = /\:\:\:.*\n.*\n*\:\:\:/g
export const codeContainerReg = /```\w*\n[\w\W]*?\n```/g