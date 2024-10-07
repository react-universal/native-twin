import { createElement } from 'react';
import jsxWrapper from './jsx-wrapper';

export { withMappedProps, createStylableComponent, stylizedComponents } from './styled';
export { getSheetEntryStyles } from './utils/sheet.utils';
export { StyleSheet, createComponentSheet } from './sheet/StyleSheet';
export { createElement };

export const createTwinElement = jsxWrapper(createElement as any);
