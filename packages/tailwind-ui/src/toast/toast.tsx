import { Span } from '@universal-labs/primitives';
import type { Toast as IToast } from 'react-hot-toast/headless';

export interface IToastPayload {
  title: string;
  description: string;
  position?: ToastPositionType;
  duration?: number;
}

export type ToastPositionType =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomRight'
  | 'bottomCenter'
  | 'bottomLeft';

export const positionClasses: Record<ToastPositionType, string> = {
  topRight: 'top-0 right-1 native:right-0',
  topCenter: 'top-0 right-1/2 translate-x-1/2',
  topLeft: 'top-0 left-1',
  bottomLeft: 'bottom-0 left-1',
  bottomCenter: 'bottom-0 right-1/2 translate-x-1/2',
  bottomRight: 'bottom-0 right-1',
};

export const animationVariables: Record<ToastPositionType, string> = {
  topRight: 'translateX(2000px)',
  topCenter: 'translateY(-1300px)',
  topLeft: 'translateX(-2000px)',
  bottomLeft: 'translateX(-2000px)',
  bottomCenter: 'translateY(1300px)',
  bottomRight: 'translateX(2000px)',
};

export interface IToastProps {
  content: IToast['message'];
  toast: IToast;
}

export const Toast = ({ content, toast }: IToastProps) => {
  return typeof content === 'function' ? <>{content(toast)}</> : <Span>{content}</Span>;
};
