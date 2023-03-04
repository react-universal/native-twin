import type { ReactNode } from 'react';

export interface IModalProps {
  visible: boolean;
  disableBackdropPress?: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  title?: string;
  children: ReactNode;
}
