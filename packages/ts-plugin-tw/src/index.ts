import { StyledPlugin } from './_plugin';
import * as ts from 'typescript/lib/tsserverlibrary';

export = (mod: { typescript: typeof ts }) => new StyledPlugin(mod.typescript);
