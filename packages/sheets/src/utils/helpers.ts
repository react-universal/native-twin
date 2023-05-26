export function normalizeCssSelectorString(className: string): string {
  return className.replace(/\\/g, '').replace('.', '');
}
