import * as Layer from 'effect/Layer';
import { logger } from './debug/debug.context';
import { extensionChannelName } from './extension/extension.constants';

export const ClientMainLive = Layer.empty.pipe(Layer.provide(logger(extensionChannelName)));
