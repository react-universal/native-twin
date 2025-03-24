import type { AnyDeclarationValue } from '../react-native/declarations/declaration.value';
import type { AnyDeclaration } from '../react-native/declarations/style.declaration';

export interface ParsedStylerDecl {
  parsedDecl: AnyDeclaration;
  parsedValue: AnyDeclarationValue | null;
  error: string | null;
}

export interface CreateStylerInput {
  platform: string;
  rem: number;
  vh?: number | undefined;
  vw?: number | undefined;
}
