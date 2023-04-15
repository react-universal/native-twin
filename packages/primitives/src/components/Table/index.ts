import type { View } from 'react-native';
import { styled, ForwardedStyledComponent } from '@universal-labs/styled';
import {
  Table as ExpoTable,
  THead as ExpoTHead,
  TFoot as ExpoTFoot,
  TH as ExpoTH,
  TD as ExpoTD,
  TBody as ExpoTBody,
  TR as ExpoTR,
} from './Table';

const Table = styled(ExpoTable) as ForwardedStyledComponent<View>;
const THead = styled(ExpoTHead) as ForwardedStyledComponent<View>;
const TFoot = styled(ExpoTFoot) as ForwardedStyledComponent<View>;
const TH = styled(ExpoTH) as ForwardedStyledComponent<View>;
const TD = styled(ExpoTD) as ForwardedStyledComponent<View>;
const TBody = styled(ExpoTBody) as ForwardedStyledComponent<View>;
const TR = styled(ExpoTR) as ForwardedStyledComponent<View>;

export { Table, THead, TFoot, TH, TD, TBody, TR };
