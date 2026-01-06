import { toast } from 'sonner';

/**
 * Toast notification helpers to replace alert() calls
 */

export const showSuccess = (message: string) => {
    toast.success(message);
};

export const showError = (message: string) => {
    toast.error(message);
};

export const showInfo = (message: string) => {
    toast.info(message);
};

export const showWarning = (message: string) => {
    toast.warning(message);
};

export const showLoading = (message: string) => {
    return toast.loading(message);
};

export const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
};

export const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
    }
) => {
    return toast.promise(promise, messages);
};
