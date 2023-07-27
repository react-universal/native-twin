import { initialize } from '@universal-labs/twind-adapter';

const tailwind = initialize({
  colors: {
    primary: 'blue',
  },
  fontFamily: {
    roboto: ['var(--font-roboto)'],
    'roboto-bold': ['var(--font-roboto)'],
    'roboto-medium': ['var(--font-roboto)'],
    sans: ['var(--font-roboto)'],
  },
});
export default tailwind;
