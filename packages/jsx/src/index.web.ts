import { createElement } from 'react';
import jsxWrapper from './jsx-wrapper.web.js';

export {
  createStylableComponent,
  stylizedComponents,
  withMappedProps,
} from './styled/index.web.js';
export { getSheetEntryStyles } from './utils/sheet.utils.js';

// export const createTwinElement = jsxWrapper(createElement as any);

export const createTwinElement = jsxWrapper(createElement as any);

export { createElement };
