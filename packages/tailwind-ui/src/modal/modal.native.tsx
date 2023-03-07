import { Modal as NativeModal } from 'react-native';
import { AppIcons } from '@medico/universal/icons';
import { View, Span, Pressable } from '@universal-labs/primitives';
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
    <NativeModal
      visible={visible}
      animationType='slide'
      onDismiss={onDismiss}
      transparent
      style={{
        backgroundColor: 'rgba(0,0,0,.7)',
      }}
    >
      <Pressable
        className={`
          absolute
          top-0
          left-0
          right-0
          bottom-0
          items-center
          justify-center
          bg-gray-500/30
        `}
        onPress={() => {
          if (!disableBackdropPress && onDismiss) {
            onDismiss();
          }
        }}
      />
      <View
        className={`
            absolute
            top-1/4
            w-[90vw]
            max-w-[500px]
            self-center
            rounded-md
            bg-white
            py-5
            px-4
            shadow-md
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
        {title ? <Span className='font-bold'>{title}</Span> : null}
        {children}
      </View>
    </NativeModal>
  );
};

export { Modal };
