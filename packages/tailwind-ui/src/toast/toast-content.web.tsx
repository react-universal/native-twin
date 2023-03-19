import cx from 'clsx';
import type { Toast as IToast } from 'react-hot-toast/headless';
import { useI18n } from '@medico/universal/i18n/hooks';
import { Pressable } from '@medico/universal/pressable';
import { Typography } from '@medico/universal/typography';
import { View } from '@medico/universal/view';
import { IToastPayload, animationVariables, ToastPositionType } from './toast';

interface IToastContentProps {
  toast: IToast;
  payload: IToastPayload;
  onDismiss: (id: string) => void;
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
  position = 'bottomRight',
  action,
}: IToastContentProps) => {
  const { t } = useI18n();
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
        <Typography className='font-roboto-medium text-xl text-gray-100'>
          {payload.title}
        </Typography>
        <Typography className='mt-2 text-gray-400'>{payload.description}</Typography>
      </View>
      <View className='grow-[10] justify-around px-3'>
        {action ? (
          <Pressable
            className='h-8 items-center justify-center rounded-xl px-2 hover:bg-gray-900'
            onPress={action.onPress}
          >
            <Typography className='font-roboto-medium text-green-600'>
              {action.label}
            </Typography>
          </Pressable>
        ) : null}
        <Pressable
          className='h-8 items-center justify-center rounded-xl px-2 hover:bg-gray-900'
          onPress={() => onDismiss(toast.id)}
        >
          <Typography className='font-roboto-medium text-gray-300'>{t('dismiss')}</Typography>
        </Pressable>
      </View>
    </View>
  );
};

export { ToastContent };
