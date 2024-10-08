import path from 'path';

export const METRO_ENDPOINT = `__native_twin_update_endpoint`;

export const INTERNAL_RESET = Symbol();
export const INTERNAL_SET = Symbol();
export const INTERNAL_FLAGS = Symbol();

export const DEFAULT_CONTAINER_NAME = '@__';

export const STYLE_SCOPES = {
  /** @description Style is the same globally */
  GLOBAL: 0,
  /** @description Style is the same within a context (variables / containers) */
  CONTEXT: 1,
  /** @description Style can affect other styles (sets variables, uses other styles) */
  SELF: 2,
};

export const transformKeys = new Set([
  'perspective',
  'translateX',
  'translateY',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'skewX',
  'skewY',
]);

export const TWIN_MODULES_CACHE_DIR = 'node_modules';
export const TWIN_CACHE_DIR = ['node_modules', '.cache', 'native-twin'].join(path.sep);
export const TWIN_CACHE_DIR_RUNTIME = ['.cache', 'native-twin'].join(path.sep);
export const TWIN_STYLES_FILE = 'twin.styles.js';
export const TWIN_OUT_CSS_FILE = 'twin.out.css';
export const TWIN_INPUT_CSS_FILE = 'twin.in.css';

export const platformVariants = ['web', 'native', 'ios', 'android'];
export const twinModuleExportString = 'module.exports = new Map([])';
export const TWIN_GLOBAL_SHEET_IMPORT_NAME = '__twinGlobal__sheet';
export const twinHMRString =
  "require('@native-twin/metro/build/config/server/poll-update-client')";
