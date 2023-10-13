import React from 'react';
import * as RN from 'react-native';
import * as List from '../custom-components/List';
import {
  styledFlatList,
  styledSectionList,
  styledVirtualizedList,
} from '../custom-components/NativeLists/List.components';
import * as NavComp from '../custom-components/Nav';
import * as TableComps from '../custom-components/Table';
import * as TextComps from '../custom-components/Text';
import styledComponentsFactory from './StyledComponent';

const styled = <StyleType, InitialProps extends { style?: RN.StyleProp<StyleType> }>(
  Component: React.ComponentType<InitialProps>,
) => styledComponentsFactory<StyleType, InitialProps>(Component);

styled.ActivityIndicator = styled(RN.ActivityIndicator);
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
styled.Pressable = styled(RN.Pressable);
styled.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback);
styled.View = styled(RN.View);
styled.FlatList = styledFlatList;
styled.SectionList = styledSectionList;
styled.VirtualizedList = styledVirtualizedList;

// WEB
styled.LI = styled(List.LI);
styled.UL = styled(List.UL);
styled.Nav = styled(NavComp.Nav);
styled.Table = styled(TableComps.Table);
styled.THead = styled(TableComps.THead);
styled.TFoot = styled(TableComps.TFoot);
styled.TH = styled(TableComps.TH);
styled.TD = styled(TableComps.TD);
styled.TBody = styled(TableComps.TBody);
styled.TR = styled(TableComps.TR);

styled.Span = styled(TextComps.Span);
styled.H1 = styled(TextComps.H1);
styled.H2 = styled(TextComps.H2);
styled.H3 = styled(TextComps.H3);
styled.H4 = styled(TextComps.H4);
styled.H5 = styled(TextComps.H5);
styled.H6 = styled(TextComps.H6);
styled.Strong = styled(TextComps.Strong);
styled.Code = styled(TextComps.Code);
styled.P = styled(TextComps.P);

export const {
  ActivityIndicator,
  Code,
  FlatList,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LI,
  Modal,
  Nav,
  P,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  SectionList,
  Span,
  Strong,
  Switch,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
  Table,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UL,
  View,
  VirtualizedList,
} = styled;

export { styled };
