export function kebab2camel(input: string) {
  if (!input.includes('-')) return input;
  return input.replace(/-./g, (x) => x.toUpperCase().charAt(1));
}
