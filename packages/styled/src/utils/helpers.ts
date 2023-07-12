export function normalizeCssSelectorString(className: string): string {
  let result = className.replace(/\\/g, '').replace('.', '');
  result = result.includes(':') ? result.split(':')[1]! : result;
  return result;
}
