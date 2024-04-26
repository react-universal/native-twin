export interface NativeTwinPluginConfiguration {
  tags: string[];
  attributes: string[];
  styles: string[];
  debug: boolean;
  enable: boolean;
  trace: {
    server: string;
  };
}

export type Logger = (message: string) => void;

export interface State {
  hasConfigFile?: boolean;
}
