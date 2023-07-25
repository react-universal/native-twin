import type { ReactNode } from 'react';
import type { FinalSheet } from '@universal-labs/css';
import type {
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
} from '../constants/ValidPseudoElements';

export interface RegisteredComponent {
  id: string;
  groupID: string;
  interactionState: Record<ValidInteractionPseudoSelector | ValidGroupPseudoSelector, boolean>;
}

export type StyledProps = {
  className?: string;
  tw?: string;
  nthChild?: number;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  parentID?: string;
  children?: ReactNode;
  groupID?: string;
};

export type ComponentStylesheet = {
  styles: FinalSheet;
  hash: string;
  isGroupParent: boolean;
  hasPointerEvents: boolean;
  hasGroupEvents: boolean;
};

export type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
  ? Props
  : TComponent extends React.Component<infer Props>
  ? Props
  : TComponent extends React.ComponentType<infer Props>
  ? Props
  : never;
