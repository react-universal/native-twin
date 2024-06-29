import { NodePath } from '@babel/traverse';
import * as Layer from 'effect/Layer';
import { makeBabelService, BabelService } from './Babel.service';
import { makeBindingService, NodeBindingSvc } from './NodeBinding.service';
import { makeReactService, ReactService } from './React.service';

const makeServiceLayer = (path: NodePath) =>
  Layer.mergeAll(makeBabelService, makeReactService(path), makeBindingService(path));

export { makeServiceLayer, BabelService, NodeBindingSvc, ReactService };
