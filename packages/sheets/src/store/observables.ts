import type { IStyleType } from '../types';

function createSubscribable<MessageType>() {
  const subscribers: Set<(message: MessageType) => void> = new Set();
  return {
    subscribe(callback: (message: MessageType) => void) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    publish(message: MessageType) {
      subscribers.forEach((l) => l(message));
    },
  };
}

type ObservableMessage<T> = {
  target: T;
  prop: string;
};

type Observable<T> = T & {
  subscribe: (callback: (data: ObservableMessage<T>) => void) => () => void;
};

function createObservable<T>(data: T): Observable<T> {
  const subscribers = createSubscribable<ObservableMessage<T>>();
  return new Proxy(
    {
      ...data,
      subscribe: subscribers.subscribe,
    },
    {
      set: function (target: object, prop: string, value: any) {
        Reflect.set(target, prop, value);
        subscribers.publish({
          target,
          prop,
        } as unknown as ObservableMessage<T>);
        return true;
      },
    },
  ) as Observable<T>;
}

type IStylesheets = [string, IStyleType];
interface IStoreObserver {
  stylesheets: IStylesheets[];
}

const styleSheetObserver = createObservable<IStoreObserver>({
  stylesheets: [],
});

export { createObservable, styleSheetObserver };
