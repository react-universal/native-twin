import { useIsDarkMode } from './useIsDarkMode';

type BlurTint = 'light' | 'dark' | 'default';

function getBackgroundColor(intensity: number, tint: BlurTint): string {
  const opacity = intensity / 100;
  switch (tint) {
    case 'dark':
      // From Apple iOS 14 Sketch Kit - https://developer.apple.com/design/resources/
      return `rgba(25,25,25,${opacity * 0.78})`;
    case 'light':
      // From Apple iOS 14 Sketch Kit - https://developer.apple.com/design/resources/
      return `rgba(249,249,249,${opacity * 0.78})`;
    case 'default':
      // From xcode composition
      return `rgba(255,255,255,${opacity * 0.3})`;
  }
}

export function useBlurredBackgroundStyles(intensity: number): {
  backgroundColor: string;
  backdropFilter: string;
  '-webkit-backdrop-filter': string;
} {
  const isDark = useIsDarkMode();

  return {
    backgroundColor: getBackgroundColor(intensity, isDark ? 'dark' : 'light'),
    backdropFilter: 'blur(20px)',
    '-webkit-backdrop-filter': 'blur(20px)',
  };
}
