import { UL as ExpoUL, LI as ExpoLI } from '@expo/html-elements';
import { styled } from '@universal-labs/styled';

ExpoUL.displayName = 'H1';
ExpoLI.displayName = 'H2';

const UL = styled(ExpoUL);
const LI = styled(ExpoLI);

export { UL, LI };
