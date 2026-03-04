import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

export const showToast = (message: string, type: ToastType) => {
  Toast.show({ type, text1: message, position: 'bottom' });
};
