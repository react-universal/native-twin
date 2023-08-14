export function isSpacingFunction(name: string) {
  if (
    name.startsWith('m-') ||
    name.startsWith('mt-') ||
    name.startsWith('ml-') ||
    name.startsWith('mb-') ||
    name.startsWith('mr-') ||
    name.startsWith('mx-') ||
    name.startsWith('my-') ||
    name.startsWith('p-') ||
    name.startsWith('pt-') ||
    name.startsWith('pl-') ||
    name.startsWith('pb-') ||
    name.startsWith('pr-') ||
    name.startsWith('px-') ||
    name.startsWith('py-') ||
    name.startsWith('space-') ||
    name.startsWith('scroll-m') ||
    name.startsWith('scroll-p') ||
    name.startsWith('inset') ||
    name.startsWith('top-') ||
    name == 'left-' ||
    name == 'bottom-' ||
    name == 'right-'
  ) {
    return true;
  }
  return false;
}
