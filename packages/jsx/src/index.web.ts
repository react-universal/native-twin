import { createElement } from 'react';
import jsxWrapper from './jsx-wrapper.web';

export {
  withMappedProps,
  createStylableComponent,
  stylizedComponents,
} from './styled/index.web';
export { getSheetEntryStyles } from './utils/sheet.utils';

// export const createTwinElement = jsxWrapper(createElement as any);

export const createTwinElement = jsxWrapper(createElement as any);

export { createElement };
