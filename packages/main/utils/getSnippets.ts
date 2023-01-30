import { snippetsReg } from '../constants/index';
import { filterHTMLTag } from "./filterHTMLTag";
import { filterMarkdown } from "./filterMarkdown";


export function getSnippets(code: string, length: number): string {
  return (
    (filterHTMLTag(filterMarkdown(code)).match(snippetsReg)?.join('').slice(0, length) || '') +
    '...'
  );
}
