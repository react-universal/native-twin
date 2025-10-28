export const REACT_FORWARD_REF_SYMBOL = Symbol.for('react.forward_ref');

export const INTERNAL_RESET = Symbol();
export const INTERNAL_SET = Symbol();
export const INTERNAL_FLAGS = Symbol();

export const DEFAULT_INTERACTIONS = Object.freeze({
  isGroupActive: false,
  isLocalActive: false,
});

type Prop = string;
type Target = string;
type ComponentKind = 'text' | 'view' | 'list' | 'scroll-view' | 'unknown';
export interface MappedComponent {
  name: string;
  kind: ComponentKind;
  config: Record<Prop, Target>;
}
const globalMappedComponents: MappedComponent[] = [];

const getComponentKind = (name: string): ComponentKind => {
  switch (name) {
    case 'FlatList':
    case 'VirtualizedList':
      return 'list';
    case 'TextInput':
    case 'Text':
      return 'text';
    case 'ScrollView':
      return 'scroll-view';
    default:
      return 'view';
  }
};

const createStylableComponent = <T extends Record<Prop, Target>>(
  component: string,
  styles: T,
): MappedComponent => {
  const mapped = {
    name: component,
    config: styles,
    kind: getComponentKind(component),
  };
  globalMappedComponents.push(mapped);
  return mapped;
};

const createMappedComponents = () => {
  createStylableComponent('Twin_UnknownElement', { className: 'style' });
  createStylableComponent('Image', { className: 'style' });
  createStylableComponent('Pressable', { className: 'style' });
  createStylableComponent('SafeAreaView', { className: 'style' });
  createStylableComponent('Switch', { className: 'style' });
  createStylableComponent('Text', { className: 'style' });
  createStylableComponent('TouchableHighlight', { className: 'style' });
  createStylableComponent('TouchableOpacity', { className: 'style' });
  createStylableComponent('TouchableWithoutFeedback', { className: 'style' });
  createStylableComponent('View', { className: 'style' });
  createStylableComponent('ActivityIndicator', {
    className: 'style',
  });
  createStylableComponent('StatusBar', {
    className: 'style',
  });
  createStylableComponent('ScrollView', {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
  });
  createStylableComponent('TextInput', {
    className: 'style',
  });

  createStylableComponent('FlatList', {
    className: 'style',
    ListFooterComponentClassName: 'ListFooterComponentStyle',
    ListHeaderComponentClassName: 'ListHeaderComponentStyle',
    columnWrapperClassName: 'columnWrapperStyle',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
  });
  createStylableComponent('ImageBackground', {
    className: 'style',
    imageClassName: 'imageStyle',
  });
  createStylableComponent('KeyboardAvoidingView', {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
  createStylableComponent('VirtualizedList', {
    className: 'style',
    ListFooterComponentClassName: 'ListFooterComponentStyle',
    ListHeaderComponentClassName: 'ListHeaderComponentStyle',
    contentContainerClassName: 'contentContainerStyle',
    indicatorClassName: 'indicatorStyle',
  });
  return globalMappedComponents;
};

export const mappedComponents = createMappedComponents();
export const commonMappedAttribute = { className: 'style' };

const componentAttrs = Array.from(
  new Set([
    'tw',
    'class',
    'className',
    'variants',
    ...mappedComponents.flatMap((x) => Object.keys(x)),
  ]),
);
export const TWIN_DEFAULT_PLUGIN_CONFIG = {
  jsxAttributes: componentAttrs,
  functions: ['tw', 'apply', 'css', 'variants', 'style', 'styled', 'createVariants'],
  debug: false,
  enable: true,
  trace: {
    server: 'off',
  } as const,
};

export type NativeTwinPluginConfiguration = typeof TWIN_DEFAULT_PLUGIN_CONFIG;

export const createCommonMappedAttribute = (tagName: string) => {
  return createStylableComponent(tagName, commonMappedAttribute);
};

export const TWIN_DEFAULT_FILES = [
  'tailwind.config.ts',
  'tailwind.config.js',
  'twin.config.ts',
  'twin.config.js',
  'native-twin.config.ts',
  'native-twin.config.js',
];

export const BABEL_JSX_PLUGIN_IMPORT_RUNTIME = ['createTwinElement', '@native-twin/jsx'] as const;

export const typePropName = '__TWIN_TYPE_PLEASE_DO_NOT_USE__';

export const labelPropName = '__TWIN_LABEL_PLEASE_DO_NOT_USE__';

export interface NativeTwinProps {
  __twinID: string;
  __parentID: string | null;
  __twinExpressions?: any | undefined;
  mappings: { [key: string]: string };
  [typePropName]: React.ElementType;
  [labelPropName]?: string;
  [key: string]: unknown;
}
