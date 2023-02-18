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

export const showSuccesses = (
  toast: React.RefObject<Toast>,
  messages: string[]
) => {
  for (const message of messages) {
    showSuccess(toast, message);
  }
};

export const showWarnings = (
  toast: React.RefObject<Toast>,
  messages: string[]
) => {
  for (const message of messages) {
    showWarning(toast, message);
  }
};

export const showFailures = (
  toast: React.RefObject<Toast>,
  messages: string[]
) => {
  for (const message of messages) {
    showFailure(toast, message);
  }
};

export const showSuccessesMapper = (
  toast: React.RefObject<Toast>,
  keys: string[],
  map: Map<string, string>
) => {
  for (const key of keys) {
    showSuccess(toast, map.get(key) ?? "");
  }
};

export const showWarningsMapper = (
  toast: React.RefObject<Toast>,
  messages: string[],
  map: Map<string, string>
) => {
  for (const key of messages) {
    showWarning(toast, map.get(key) ?? "");
  }
};

export const showFailuresMapper = (
  toast: React.RefObject<Toast>,
  messages: string[],
  map: Map<string, string>
) => {
  for (const key of messages) {
    showFailure(toast, map.get(key) ?? "");
  }
};
