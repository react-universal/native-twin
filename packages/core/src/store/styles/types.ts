export type TStyleObject = {
  styles: Record<string, any>;
};

export type IStylesStore = {
  cache: [string, TStyleObject['styles']][];
  setCache: (className: string, styles: TStyleObject['styles']) => void;
  compileClassName: (className: string) => TStyleObject['styles'];
};
