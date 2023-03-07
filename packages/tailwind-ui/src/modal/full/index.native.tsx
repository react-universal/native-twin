import type { PropsWithChildren } from 'react';
import { Modal, SafeAreaView } from 'react-native';
import { Portal } from '@gorhom/portal';
import { Pressable, View } from '@universal-labs/primitives';
import { AppIcons } from '../../common';

interface IFullWideModalProps extends PropsWithChildren {
  visible: boolean;
  onDismiss(): void;
}

export const FullWideModal = ({ children, visible, onDismiss }: IFullWideModalProps) => {
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} transparent animationType='slide'>
        <SafeAreaView style={{ flex: 1 }}>
          <View className='mx-1 my-1 flex-1 rounded-md bg-white'>
            <View className='mb-5 mt-2 flex-row justify-end'>
              <Pressable onPress={onDismiss} className='bg-error mr-3 mt-2 rounded-full'>
                <AppIcons name='close' color='white' size='lg' />
              </Pressable>
            </View>
            {children}
          </View>
        </SafeAreaView>
      </Modal>
    </Portal>
  );
};
