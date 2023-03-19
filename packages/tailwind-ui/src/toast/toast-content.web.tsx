import { Span, View, Pressable } from '@universal-labs/primitives';
import cx from 'clsx';
import type { Toast as IToast } from 'react-hot-toast/headless';
import { IToastPayload, animationVariables, ToastPositionType } from './toast';

interface IToastContentProps {
  toast: IToast;
  payload: IToastPayload;
  onDismiss: (id: string) => void;
  dismissLabel: string;
  position?: ToastPositionType;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const ToastContent = ({
  toast,
  payload,
  onDismiss,
  dismissLabel,
  position = 'bottomRight',
  action,
}: IToastContentProps) => {
  return (
    <View
      className={cx(
        'mb-3 w-full flex-row justify-between bg-gray-800',
        'rounded-lg shadow-lg',
        animationVariables[position],
        toast.visible ? 'animate-toast-in' : 'animate-toast-out',
      )}
    >
      <View className='grow-[90] py-4 pl-5'>
        <Span className='font-roboto-medium text-xl text-gray-100'>{payload.title}</Span>
        <Span className='mt-2 text-gray-400'>{payload.description}</Span>
      </View>
      <View className='grow-[10] justify-around px-3'>
        {action ? (
          <Pressable
            className='h-8 items-center justify-center rounded-xl px-2 hover:bg-gray-900'
            onPress={action.onPress}
          >
            <Span className='font-roboto-medium text-green-600'>{action.label}</Span>
          </Pressable>
        ) : null}
        <Pressable
          className='h-8 items-center justify-center rounded-xl px-2 hover:bg-gray-900'
          onPress={() => onDismiss(toast.id)}
        >
          <Span className='font-roboto-medium text-gray-300'>{dismissLabel}</Span>
        </Pressable>
      </View>
    </View>
  );
};

export { ToastContent };
