import {
  ArbitraryToken,
  ClassNameToken,
  SheetEntry,
  TWParsedRule,
  VariantClassToken,
  VariantToken,
} from '@native-twin/css';

export type LocatedParser<A extends object> = {
  start: number;
  end: number;
} & A;

export interface LocatedGroupToken {
  type: 'GROUP';
  value: {
    base: LocatedParser<ClassNameToken> | LocatedParser<VariantToken>;
    content: TemplateToken[];
  };
}

export type TemplateToken =
  | LocatedParser<LocatedGroupToken>
  | LocatedParser<VariantClassToken>
  | LocatedParser<VariantToken>
  | LocatedParser<ClassNameToken>
  | LocatedParser<ArbitraryToken>;

export interface LocatedParsedRule extends TWParsedRule {
  loc: {
    start: number;
    end: number;
  };
  type: TemplateToken['type'];
}

export interface LocatedSheetEntry extends SheetEntry {
  loc: {
    start: number;
    end: number;
  };
}