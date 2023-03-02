const getReduxDevToolsConnection = (storeName: string) => {
  if (typeof window !== 'undefined') {
    return window?.__REDUX_DEVTOOLS_EXTENSION__?.connect({
      name: storeName,
    });
  }
  return undefined;
};

const reduxDevToolsConnection = getReduxDevToolsConnection('Store');

export { reduxDevToolsConnection };
