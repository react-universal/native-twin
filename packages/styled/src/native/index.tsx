import React from 'react';
import * as RN from 'react-native';
import {
  styledFlatList,
  styledSectionList,
  styledVirtualizedList,
} from '../custom-components/List.components';
import createStyledComponent from './StyledComponent';

const styled = <StyleType, InitialProps extends { style?: RN.StyleProp<StyleType> }>(
  Component: React.ComponentType<InitialProps>,
) => createStyledComponent<StyleType, InitialProps>(Component);

styled.ActivityIndicator = styled(RN.ActivityIndicator);
styled.DrawerLayoutAndroid = styled(RN.DrawerLayoutAndroid);
styled.Image = styled(RN.Image);
styled.ImageBackground = styled(RN.ImageBackground);
styled.KeyboardAvoidingView = styled(RN.KeyboardAvoidingView);
styled.Modal = styled(RN.Modal);
styled.ScrollView = styled(RN.ScrollView);
styled.Switch = styled(RN.Switch);
styled.RefreshControl = styled(RN.RefreshControl);
styled.SafeAreaView = styled(RN.SafeAreaView);
styled.Text = styled(RN.Text);
styled.TextInput = styled(RN.TextInput);
styled.TouchableHighlight = styled(RN.TouchableHighlight);
styled.TouchableNativeFeedback = styled(RN.TouchableNativeFeedback);
styled.TouchableOpacity = styled(RN.TouchableOpacity);
styled.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback);
styled.View = styled(RN.View);
styled.FlatList = styledFlatList;
styled.SectionList = styledSectionList;
styled.VirtualizedList = styledVirtualizedList;

export { styled as styledComponents };
