import { NodePath } from '@babel/traverse';
import * as Layer from 'effect/Layer';
import { makeBabelService, BabelService } from '../babel/Babel.service';
import { BindingServiceLive, NodeBindingSvc } from './NodeBinding.service';
import { ReactLive, ReactService } from './React.service';

const makeServiceLayer = (path: NodePath) =>
  ReactLive.pipe(Layer.merge(BindingServiceLive)).pipe(
    Layer.provideMerge(makeBabelService(path)),
  );

export { makeServiceLayer, BabelService, NodeBindingSvc, ReactService };
