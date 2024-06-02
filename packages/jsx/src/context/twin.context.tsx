import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { JSXStyledProps } from '../jsx/jsx-custom-props';

export interface InteractionPropsState {
  isGroupActive: boolean;
  isPointerActive: boolean;
}

export function useTwinProvider(): {
  get: () => boolean;
  set: (value: boolean) => void;
  subscribe: (cb: () => void) => () => void;
} {
  const subscribers = useRef(new Set<() => void>());
  const store = useRef(false);

  const get = useCallback(() => store.current, []);
  const set = useCallback((values: boolean) => {
    store.current = values;
    subscribers.current.forEach((x) => x());
  }, []);

  const subscribe = useCallback((cb: () => void) => {
    subscribers.current.add(cb);
    return () => subscribers.current.delete(cb);
  }, []);

  return {
    get,
    set,
    subscribe,
  };
}

export type TwinInteractions = ReturnType<typeof useTwinProvider>;

export const TwinContext = createContext<TwinInteractions>({
  get() {
    return false;
  },
  set: () => void {},
  subscribe() {
    return () => void {};
  },
});

// export function TwinProvider({ children }: { children: ReactNode }) {
//   return <TwinContext.Provider value={useTwinProvider()}>{children}</TwinContext.Provider>;
// }

export function useTwinContext(
  styledProps: JSXStyledProps[] = [],
): [boolean, (values: boolean) => void] {
  const context = useContext(TwinContext);
  const [, setState] = useState(context.get());

  useEffect(() => {
    const isGroupParent = styledProps.some(
      (x) => x[1].metadata.isGroupParent || x[1].metadata.hasGroupEvents,
    );
    return context?.subscribe(() => {
      if (isGroupParent) {
        setState(context.get());
      }
    });
  }, [styledProps]);

  return [context.get(), context.set];
}

// const REDUCER_ACTIONS = {
//   SET_INTERNAL_STATE: 'SET_INTERNAL_STATE',
//   SET_CONTEXT_STATE: 'SET_CONTEXT_STATE',
// } as const;

// // An interface for our actions
// interface ReducerAction<Type extends keyof typeof REDUCER_ACTIONS> {
//   type: Type;
//   payload: boolean;
// }

// export function useTwinReducerProvider(styledProps: JSXStyledProps[]) {
//   const [state, _dispatch] = useReducer(contextReducer, {
//     internalState: {
//       pointerActive: false,
//     },
//     groupState: {
//       pointerActive: false,
//     },
//   });

//   return { state };
// }

// interface FullReducer {
//   internalState: {
//     pointerActive: boolean;
//   };
//   groupState: {
//     pointerActive: boolean;
//   };
// }

// // Our reducer function that uses a switch statement to handle our actions
// function contextReducer<Type extends keyof typeof REDUCER_ACTIONS>(
//   state: FullReducer,
//   action: ReducerAction<Type>,
// ): FullReducer {
//   const { type, payload } = action;
//   switch (type) {
//     case 'SET_CONTEXT_STATE':
//       return {
//         internalState: state.internalState,
//         groupState: {
//           pointerActive: payload,
//         },
//       };
//     case 'SET_INTERNAL_STATE':
//       return {
//         groupState: state.groupState,
//         internalState: {
//           pointerActive: payload,
//         },
//       };
//     default:
//       return state;
//   }
// }
