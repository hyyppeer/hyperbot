export function replaceAll(str: string, replaced: string, replacement: string): string {
  return str.split(replaced).join(replacement);
}
