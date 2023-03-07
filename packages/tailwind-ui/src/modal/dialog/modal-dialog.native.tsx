import { Modal } from 'react-native';
import { H4, View } from '@universal-labs/primitives';
import { Button } from '../../common';

interface IDialogModalProps {
  showDialog: boolean;
  title: string;
  content: string;
  onConfirm(): void;
  onDismiss(): void;
  confirmText: string;
  cancelText: string;
}

export const DialogModal = ({
  showDialog,
  title,
  onConfirm,
  onDismiss,
  content,
  cancelText,
  confirmText,
}: IDialogModalProps) => {
  return (
    <Modal visible={showDialog} transparent onDismiss={onDismiss} animationType='slide'>
      <View className='flex-1 items-center justify-center bg-gray-700/50'>
        <View
          // dismissable={false}
          className='w-full max-w-[90%] self-center rounded-md bg-white py-5 px-4'
        >
          <H4 className='text-primary-50'>{title}</H4>
          <View className='mt-5 mb-4'>
            <H4>{content}</H4>
          </View>
          <View className='flex-row justify-end'>
            <Button className='mx-1 max-w-[35%]' onPress={onConfirm}>
              {confirmText}
            </Button>
            <Button className='bg-error mx-1 max-w-[35%]' onPress={onDismiss}>
              {cancelText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
