export type TStyleObject = {
  styles: Record<string, any>;
};

export type IStylesStore = {
  cache: Map<string, TStyleObject['styles']>;
  setCache: (className: string, styles: TStyleObject['styles']) => void;
  compileClassName: (className: string) => TStyleObject['styles'];
};
