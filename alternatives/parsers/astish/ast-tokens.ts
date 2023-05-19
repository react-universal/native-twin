export const TokenTypeMap = {
  COMMENT: 'COMMENT',
  SELECTOR: 'SELECTOR',
  RULE: 'RULE',
  SHEET: 'SHEET',
  DECLARATION: 'DECLARATION',
  UNKNOWN: 'UNKNOWN',
  EOF: 'EOF',
} as const;

export type TokenType = keyof typeof TokenTypeMap;

export class TokenNode<T extends TokenType, Value> {
  type: T;
  value: Value;
  constructor(value: Value) {
    this.value = value;
    this.type = 'COMMENT' as T;
  }
}

export class CommentNode extends TokenNode<'COMMENT', string> {
  constructor(value: string) {
    super(value);
    this.type = 'COMMENT';
  }
}

export class SelectorNode extends TokenNode<'SELECTOR', string> {
  constructor(value: string) {
    super(value);
    this.type = 'SELECTOR';
  }
}

export class RuleNode extends TokenNode<'RULE', string> {
  selector: SelectorNode;
  declarations: DeclarationNode[];
  constructor(value: string, selector: SelectorNode) {
    super(value);
    this.type = 'RULE';
    this.selector = selector;
    this.declarations = [];
  }

  addDeclaration(declaration: DeclarationNode[]) {
    this.declarations.push(...declaration);
  }
}

export type DeclarationValue = { property: string; value: string };
export class DeclarationNode extends TokenNode<'DECLARATION', DeclarationValue> {
  constructor(value: DeclarationValue) {
    super(value);
    this.type = 'DECLARATION';
    this.value = value;
  }
}

export class SheetNode extends TokenNode<'SHEET', string> {
  rules: RuleNode[];
  constructor(value: string) {
    super(value);
    this.type = 'SHEET';
    this.rules = [];
  }

  addRule(rule: RuleNode) {
    this.rules.push(rule);
  }
}
