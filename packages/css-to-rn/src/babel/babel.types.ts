export interface CompilerInput {
  code: string;
  filename: string;
  options: {
    outputCSS: string;
    platform: string;
    inputCSS: string;
    projectRoot: string;
    twinConfigPath: string;
  };
}
