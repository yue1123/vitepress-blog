
export function escapeVueInCode(md: string) {
  return md.replace(/{{([\w\W]*?)}}/g, '&lbrace;&lbrace;$1&rbrace;&rbrace;');
}
