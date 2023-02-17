import { Toast } from "primereact/toast";

export const showSuccess = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "success", summary: message });
};

export const showWarning = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "warn", summary: message });
};

export const showFailure = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "error", summary: message });
};
