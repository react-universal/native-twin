import * as Layer from 'effect/Layer';
import { TwinGraphosContextLive } from '../core/TwinGraphos';
import { TwinParserContextLive } from '../core/TwinParser.service';
import { LSPDocumentsCtxLive } from './ConnectionHandler.api';

export const LSPBaseLayerLive = Layer.empty.pipe(
  Layer.provideMerge(TwinGraphosContextLive),
  Layer.provideMerge(LSPDocumentsCtxLive),
  Layer.provideMerge(TwinParserContextLive),
);
