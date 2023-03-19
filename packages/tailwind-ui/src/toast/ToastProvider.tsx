import { ReactNode, createContext, memo, useContext } from 'react';
import toast, { useToaster } from 'react-hot-toast/headless';
import { Toast, IToastPayload, positionClasses } from '@medico/universal/toast/toast';
import { ToastContent } from '@medico/universal/toast/toast-content';
import { View } from '@medico/universal/view';

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
