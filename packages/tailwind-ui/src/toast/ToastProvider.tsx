import { ReactNode, createContext, memo, useContext } from 'react';
import { View } from '@universal-labs/primitives';
import toast, { useToaster } from 'react-hot-toast/headless';
import { Toast, IToastPayload, positionClasses } from './toast';
import { ToastContent } from './toast-content';

interface IToastProviderProps {
  children: ReactNode;
}

interface IToastContext {
  show: (payload: IToastPayload) => void;
}

const ToastContext = createContext<IToastContext>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

const useToastProvider = () => {
  const { toasts, handlers } = useToaster();
  const show = (payload: IToastPayload) => {
    toast.custom(
      (t) => (
        <ToastContent
          dismissLabel='Dismiss'
          onDismiss={toast.dismiss}
          payload={payload}
          toast={t}
          updateHeight={(height) => handlers.updateHeight(t.id, height)}
          offset={handlers.calculateOffset(t, {
            reverseOrder: false,
          })}
        />
      ),
      {
        position: 'top-right',
        duration: payload.duration ?? 5000,
      },
    );
  };
  const onDismiss = (id: string) => {
    toast.dismiss(id);
  };
  return {
    show,
    onDismiss,
    toasts,
  };
};

const ToastProviderFor = ({ children }: IToastProviderProps) => {
  const values = useToastProvider();

  return (
    <ToastContext.Provider value={{ show: values.show }}>
      <View
        className={`
          ${positionClasses.topRight}
          native:mt-10
          web:fixed
          native:absolute
          web:max-w-lg
          native:max-w-screen-sm
          z-50
          w-screen
        `}
      >
        {values.toasts.map((t) => (
          <Toast key={t.id} content={t.message} toast={t} />
        ))}
      </View>
      {children}
    </ToastContext.Provider>
  );
};

const ToastProvider = memo(ToastProviderFor);

export { ToastProvider };
