import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  View,
  Image,
  TouchableHighlight,
  TouchableWithoutFeedback,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  VirtualizedList,
} from 'react-native';
import { nativeTwinInterop, remapProps } from './api';

nativeTwinInterop(Image, { className: 'style' });
nativeTwinInterop(Pressable, { className: 'style' });
nativeTwinInterop(SafeAreaView, { className: 'style' });
nativeTwinInterop(Switch, { className: 'style' });
nativeTwinInterop(Text, { className: 'style' });
nativeTwinInterop(TouchableHighlight, { className: 'style' });
nativeTwinInterop(TouchableOpacity, { className: 'style' });
nativeTwinInterop(TouchableWithoutFeedback, { className: 'style' });
nativeTwinInterop(View, { className: 'style' });
nativeTwinInterop(ActivityIndicator, {
  className: { target: 'style', nativeStyleToProp: { color: true } },
});
nativeTwinInterop(StatusBar, {
  className: { target: false, nativeStyleToProp: { backgroundColor: true } },
});
nativeTwinInterop(ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle',
});
nativeTwinInterop(TextInput, {
  className: { target: 'style', nativeStyleToProp: { textAlign: true } },
});

remapProps(FlatList, {
  className: 'style',
  ListFooterComponentClassName: 'ListFooterComponentStyle',
  ListHeaderComponentClassName: 'ListHeaderComponentStyle',
  columnWrapperClassName: 'columnWrapperStyle',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle',
});
remapProps(ImageBackground, {
  className: 'style',
  imageClassName: 'imageStyle',
});
remapProps(KeyboardAvoidingView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
remapProps(VirtualizedList, {
  className: 'style',
  ListFooterComponentClassName: 'ListFooterComponentStyle',
  ListHeaderComponentClassName: 'ListHeaderComponentStyle',
  contentContainerClassName: 'contentContainerStyle',
  indicatorClassName: 'indicatorStyle',
});
