import { ConfigurationManager } from '../language-service/configuration';

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

const configManager = new ConfigurationManager();

export const globalStore = createStore({
  hasConfigurationCapability: false,
  hasWorkspaceFolderCapability: false,
  hasDiagnosticRelatedInformationCapability: false,
  configManager,
});
