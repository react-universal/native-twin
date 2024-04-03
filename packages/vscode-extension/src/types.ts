export interface SynchronizedConfiguration {
  tags: ReadonlyArray<string>;
  attributes: ReadonlyArray<string>;
  styles: ReadonlyArray<string>;
  debug: boolean;
  enable: boolean;
}

export type Logger = (message: string) => void;

export interface State {
  hasConfigFile?: boolean;
}
