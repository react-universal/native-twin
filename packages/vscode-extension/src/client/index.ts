import * as Layer from 'effect/Layer';
import { extensionChannelName } from './extension/extension.constants';
import { ExtensionLogger } from './extension/extension.logger';

export const ClientMainLive = Layer.empty.pipe(
  Layer.provide(ExtensionLogger(extensionChannelName)),
);
