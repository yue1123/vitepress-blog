import {
  codeContainerReg, containerReg, frontmatterReg,
  imgReg,
  linkReg,
  mdFrontmatter
} from '../constants/index';


export function filterMarkdown(str: string): string {
  str = str
    .replace(frontmatterReg, '')
    .replace(imgReg, '')
    .replace(mdFrontmatter, '')
    .replace(linkReg, '')
    .replace(containerReg, '')
    .replace(codeContainerReg, '');
  return str;
}
