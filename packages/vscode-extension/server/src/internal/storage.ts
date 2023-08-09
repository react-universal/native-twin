const createStore = <StoreShape>(initialState: StoreShape) => {
  let currentState = { ...initialState };
  return {
    getState() {
      return currentState;
    },
    setState(cb: (newState: StoreShape) => StoreShape) {
      currentState = cb(currentState);
    },
  };
};

export const globalStore = createStore({
  hasConfigurationCapability: false,
  hasWorkspaceFolderCapability: false,
  hasDiagnosticRelatedInformationCapability: false,
});
