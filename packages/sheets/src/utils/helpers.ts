export function normalizeClassNameString(className: string): string {
  return className.replace(/\\/g, '').replace('.', '');
}
