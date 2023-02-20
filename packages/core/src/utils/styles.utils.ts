import { setup } from '@react-universal/tailwind';
import type { IStyleType } from '../types/styles.types';

const twj = setup({ content: ['__'] });

export function transformClassNames(...classes: string[]): IStyleType {
  try {
    console.log('CLASSES: ', classes);
    const styles = twj(classes.join(' '));
    console.log('STYLES: ', styles);
    return {};
  } catch (error) {
    console.log('ERROR TRANSFORMING CSS TO JS: ', error);
    return {};
  }
}
