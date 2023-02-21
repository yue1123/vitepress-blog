
export function filterHTMLTag(str: string): string {
  if (!str)
    return '';
  return str
    .replace(/<\/?[^>]*>/g, '')
    .replace(/[|]*\n/, '')
    .replace(/&\w+;/gi, '');
}
