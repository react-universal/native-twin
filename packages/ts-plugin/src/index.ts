import * as ts from 'typescript/lib/tsserverlibrary';
import { StyledPlugin } from './_plugin';

export = (mod: { typescript: typeof ts }) => new StyledPlugin(mod.typescript);
