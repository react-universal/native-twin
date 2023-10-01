export function getStyleElement(
  selector: string | null | undefined | false,
): HTMLStyleElement {
  let style = document.querySelector(selector || 'style[data-native-tailwind=""]');

  if (!style || style.tagName != 'STYLE') {
    style = document.createElement('style');
    document.head.prepend(style);
  }

  (style as HTMLElement).dataset['nativeTailwind'] = 'claimed';

  return style as HTMLStyleElement;
}
