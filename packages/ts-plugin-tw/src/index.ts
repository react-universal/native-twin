// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { StyledPlugin } from './_plugin';
import * as ts from 'typescript/lib/tsserverlibrary';

export = (mod: { typescript: typeof ts }) => new StyledPlugin(mod.typescript);
