const getReduxDevToolsConnection = (storeName: string) => {
  // @ts-expect-error
  if (typeof window !== 'undefined') {
    // @ts-ignore
    return window?.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: storeName,
    });
  }
  return undefined;
};
// @ts-ignore
const reduxDevToolsConnection = getReduxDevToolsConnection('Store');

export { reduxDevToolsConnection };
