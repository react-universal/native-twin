export const JSX_REGISTER = 'jsx/register';

export interface NativeTwinAppEvent {
  _tag: 'NativeTwinAppEvent';
  name: string;
  payload: string;
}

export interface NativeTwinWebEvent {
  _tag: 'NativeTwinWebEvent';
  name: string;
  payload: string;
}
