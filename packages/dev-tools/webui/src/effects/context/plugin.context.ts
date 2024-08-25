import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as PubSub from 'effect/PubSub';
import * as Queue from 'effect/Queue';
import { createRuntimeContext } from './runtime.context';

export type Message<T = object> = {
  message: string;
  payload: T;
};

export class MessageBusImpl {
  constructor(private readonly bus: PubSub.PubSub<Message>) {}

  publish = (message: Message) => this.bus.pipe(PubSub.publish(message));
  register(fn: <T>(message: Message<T>) => void) {
    return this.bus.pipe(
      PubSub.subscribe,
      Effect.andThen((sub) => sub.pipe(Queue.take, Effect.tap(fn), Effect.forever)),
      Effect.scoped,
    );
  }

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so. If references to the bus are kept, it will not be garbage collected.
}

export class MessageBus extends Context.Tag('@App/MessageBus')<
  MessageBus,
  MessageBusImpl
>() {}

// TODO: consider using a true global store/config, that stores data that is shared between modules after events. For example the endpoint url, when selected which is updated over the bus in the LightBulb module. By pulling from the global store/config we can set default values. It might make sense to make this more atomic, where the defaults are set in different modules based on a single entity. Another solution would be to use the new replay feature of effect pubsub to replay the last message on a new subscription. It might also be an idea, to have a replay of length 1 using the data layer, such that when a component remounts , we repopulate the state and fetch if not available. if there are any local events we reapply them afterwards.

const layer = pipe(
  Layer.effect(
    MessageBus,
    pipe(
      PubSub.unbounded<Message>({ replay: 0 }),
      Effect.andThen((bus) => new MessageBusImpl(bus)),
    ),
  ),
);

// TODO: consider using Stream.asyncPush with Effect.acquireRelease, to setup an actor with xState, such that the Stream can be made available with an injection token within the layer responsible for the store initialization. This way we can update entity stores from xState.

export const AppRuntime = createRuntimeContext(layer);
