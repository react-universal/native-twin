import type { ReactNode } from 'react';
import type { CompleteStyle, FinalSheet } from '@universal-labs/css';
import type {
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
} from '@universal-labs/css';

export interface RegisteredComponent {
  id: string;
  groupID: string;
  interactionState: Record<ValidInteractionPseudoSelector | ValidGroupPseudoSelector, boolean>;
}

export interface ClassNameProps {
  className?: string;
  tw?: string;
}

export interface StyledComponentProps extends ClassNameProps {
  nthChild?: number;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  parentID?: string;
  children?: ReactNode;
  groupID?: string;
}

export type ComponentStylesheet = {
  styles: FinalSheet;
  hash: string;
  isGroupParent: boolean;
  hasPointerEvents: boolean;
  hasGroupEvents: boolean;
};

export type PropsFrom<TComponent> =
  TComponent extends React.FC<infer Props>
    ? Props
    : TComponent extends React.Component<infer Props>
      ? Props
      : TComponent extends React.ComponentType<infer Props>
        ? Props
        : never;

// @typescript-eslint/no-empty-interface
export interface DefaultTheme {}

export type Primitive = number | (string & {}) | null | undefined | boolean | CompleteStyle;

export type TemplateFunctions<T> = (
  arg: T & { theme?: DefaultTheme } & StyledComponentProps,
) => Primitive;

export type OmitUndefined<T> = T extends undefined ? never : T;
