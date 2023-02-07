export type IStylesStore = {
  cache: Map<string, unknown>;
  setCache: (id: string) => void;
};
