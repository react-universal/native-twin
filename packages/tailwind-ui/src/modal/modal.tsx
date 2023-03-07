import * as Dialog from '@radix-ui/react-dialog';
import { View, Pressable } from '@universal-labs/primitives';
import { AppIcons } from '../common';
import type { IModalProps } from './types';

const Modal = ({
  onClose,
  onDismiss,
  visible,
  disableBackdropPress = false,
  title,
  children,
}: IModalProps) => {
  return (
    <Dialog.Root open={visible} defaultOpen={visible} modal>
      <Dialog.Portal className='-z-10'>
        <Dialog.Overlay
          onClick={onDismiss}
          className={`
            animate-modalOverlayShow
            fixed
            top-0
            left-0
            right-0
            bottom-0
            items-center
            justify-center
            bg-gray-500/30
            transition-all
          `}
        />
        <Dialog.Content
          className={`
            animate-modalContentShow
            fixed
            top-[40%]
            left-[50%]
            w-[90vw]
            max-w-[500px]
            -translate-x-[50%]
            -translate-y-[50%]
            rounded-md
            bg-white
            py-5
            px-4
            shadow-md
            transition-all
            dark:bg-gray-700
          `}
        >
          {!disableBackdropPress ? (
            <View className='flex-row justify-end'>
              <Pressable
                className='bg-error h-8 w-8 items-center justify-center rounded-full p-1'
                onPress={onClose}
              >
                <AppIcons name='close' color='white' />
              </Pressable>
            </View>
          ) : null}
          {title ? (
            <Dialog.Title className='font-roboto-bold text-lg font-bold dark:text-gray-100'>
              {title}
            </Dialog.Title>
          ) : null}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { Modal };
