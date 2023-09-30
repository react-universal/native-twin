import type { Platform } from 'react-native';
import type { SelectorGroup } from './css.types';
import type { AnyStyle, FinalSheet } from './rn.types';

export interface CssParserData {
  context: {
    rem: number;
    deviceWidth: number;
    deviceHeight: number;
    platform: Platform['OS'];
    colorScheme: 'dark' | 'light';
    debug: boolean;
  };
  styles: FinalSheet;
  cache: {
    get: (selector: string) => AnyStyle | null;
    set: (selector: string, style: AnyStyle) => void;
  };
}

export type CssParserCache = Map<string, CssNode>;

export type CssNode = {
  selector: {
    group: SelectorGroup;
    value: string;
  };
  declarations: AnyStyle;
};
