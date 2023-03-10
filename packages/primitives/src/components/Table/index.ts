import {
  Table as ExpoTable,
  THead as ExpoTHead,
  TFoot as ExpoTFoot,
  TH as ExpoTH,
  TD as ExpoTD,
  TBody as ExpoTBody,
  TR as ExpoTR,
} from '@expo/html-elements';
import { styled } from '@universal-labs/styled';

const Table = styled(ExpoTable);
const THead = styled(ExpoTHead);
const TFoot = styled(ExpoTFoot);
const TH = styled(ExpoTH);
const TD = styled(ExpoTD);
const TBody = styled(ExpoTBody);
const TR = styled(ExpoTR);

export { Table, THead, TFoot, TH, TD, TBody, TR };
