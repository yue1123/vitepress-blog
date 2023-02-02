import { statSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function copy(src: string, dest: string) {
  const stat = statSync(src);
  if (stat.isDirectory())
    copyDir(src, dest);
  else
    copyFileSync(src, dest);
}
export function copyDir(srcDir: string, destDir: string) {
  mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(srcDir)) {
    const srcFile = resolve(srcDir, file);
    const destFile = resolve(destDir, file);
    copy(srcFile, destFile);
  }
}
