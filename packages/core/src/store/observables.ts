const createSubscribable = <MessageType>() => {
  const subscribers: Set<(msg: MessageType) => void> = new Set();
  return {
    subscribe(cb: (msg: MessageType) => void): () => void {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    publish(msg: MessageType): void {
      subscribers.forEach((cb) => cb(msg));
    },
  };
};

type ObservableMessage<T> = {
  target: T;
  prop: string;
};

type Observable<T> = T & {
  subscribe: (callback: (data: ObservableMessage<T>) => void) => () => void;
};

const createObservable = <DataType>(data: DataType): Observable<DataType> => {
  const subscribers = createSubscribable<ObservableMessage<DataType>>();
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
        } as unknown as ObservableMessage<DataType>);
        return true;
      },
    },
  ) as Observable<DataType>;
};

export { createObservable, createSubscribable };
