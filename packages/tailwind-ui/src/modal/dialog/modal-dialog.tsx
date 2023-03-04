import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@medico/universal/button';
import { Typography } from '@medico/universal/typography';
import { View } from '@medico/universal/view';

interface IDialogModalProps {
  showDialog: boolean;
  title: string;
  content: string;
  onConfirm(): void;
  onDismiss(): void;
  confirmText: string;
  cancelText: string;
  dismissable?: boolean;
}

export const DialogModal = ({
  showDialog,
  title,
  onConfirm,
  onDismiss,
  content,
  cancelText,
  confirmText,
  dismissable = true,
}: IDialogModalProps) => {
  return (
    <AlertDialog.Root open={showDialog} onOpenChange={onDismiss}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className='animate-modalOverlayShow fixed inset-0 bg-gray-700/50 transition-all'
          onClick={() => {
            if (dismissable) {
              onDismiss();
            }
          }}
        />
        <AlertDialog.Content
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
        `}
        >
          <Typography variant='h3' className='text-primary-50 text-lg font-bold'>
            {title}
          </Typography>
          <View className='mt-2 mb-5'>
            <Typography className='text-sm'>{content}</Typography>
          </View>
          <View className='flex-row justify-end gap-8'>
            <Button variant='primary' className='w-fit' onPress={onConfirm}>
              {confirmText}
            </Button>
            <Button className='!bg-error w-fit' onPress={onDismiss}>
              {cancelText}
            </Button>
          </View>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
