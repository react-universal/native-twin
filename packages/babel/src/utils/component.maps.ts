export interface MappedComponent {
  name: string;
  config: Record<string, string>;
}
const createHandler = () => {
  const mappedComponents: MappedComponent[] = [];
  const createStylableComponent = <T extends Record<string, string>>(
    component: string,
    styles: T,
  ) => {
    mappedComponents.push({
      name: component,
      config: styles,
    });
  };
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
  return mappedComponents;
};

export const mappedComponents = createHandler();
