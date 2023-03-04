import type { PropsWithChildren } from 'react';
import { Modal, SafeAreaView, ScrollView } from 'react-native';
import { AppIcons } from '@medico/universal/icons';
import { Pressable } from '@medico/universal/pressable';
import { View } from '@medico/universal/view';

interface IFullWideModalProps extends PropsWithChildren {
  visible: boolean;
  onDismiss(): void;
}

export const FullWideModal = ({ children, visible, onDismiss }: IFullWideModalProps) => {
  return (
    <Modal visible={visible} onDismiss={onDismiss} transparent animationType='slide'>
      <SafeAreaView style={{ flex: 1 }}>
        <View className='mx-1 my-1 flex-1 rounded-md bg-white'>
          <View className='mb-5 mt-2 flex-row justify-end'>
            <Pressable onPress={onDismiss} className='bg-error mr-3 mt-2 rounded-full'>
              <AppIcons name='close' color='white' size='lg' />
            </Pressable>
          </View>
          <ScrollView
            automaticallyAdjustKeyboardInsets
            automaticallyAdjustsScrollIndicatorInsets
            stickyHeaderHiddenOnScroll
            className='flex-1'
            // contentContainerStyle='px-4'
          >
            {children}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
