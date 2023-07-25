import React from 'react';
import * as RN from 'react-native';
import { LI, UL } from '../custom-components/List';
import {
  styledFlatList,
  styledSectionList,
  styledVirtualizedList,
} from '../custom-components/NativeLists/List.components';
import { Nav } from '../custom-components/Nav';
import { TBody, TD, TFoot, TH, THead, TR, Table } from '../custom-components/Table';
import { Span, H1, H2, H3, H4, H5, H6, Strong, Code, P } from '../custom-components/Text';
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
styled.Pressable = styled(RN.Pressable);
styled.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback);
styled.View = styled(RN.View);
styled.FlatList = styledFlatList;
styled.SectionList = styledSectionList;
styled.VirtualizedList = styledVirtualizedList;

// WEB
styled.LI = styled(LI);
styled.UL = styled(UL);
styled.Nav = styled(Nav);
styled.Table = styled(Table);
styled.THead = styled(THead);
styled.TFoot = styled(TFoot);
styled.TH = styled(TH);
styled.TD = styled(TD);
styled.TBody = styled(TBody);
styled.TR = styled(TR);

styled.Span = styled(Span);
styled.H1 = styled(H1);
styled.H2 = styled(H2);
styled.H3 = styled(H3);
styled.H4 = styled(H4);
styled.H5 = styled(H5);
styled.H6 = styled(H6);
styled.Strong = styled(Strong);
styled.Code = styled(Code);
styled.P = styled(P);

export default styled;
