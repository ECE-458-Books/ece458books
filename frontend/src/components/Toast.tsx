import { Toast } from "primereact/toast";

export const showSuccess = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "success", summary: message, life: 2000 });
};

export const showWarning = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "warn", summary: message });
};

export const showFailure = (toast: React.RefObject<Toast>, message: string) => {
  toast.current?.show({ severity: "error", summary: message, sticky: true });
};

// This was the only way I could get toast to show multiple errors in a row,
// by separating them with a 100ms delay
export const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function showSuccesses(
  toast: React.RefObject<Toast>,
  messages: string[]
) {
  for (const message of messages) {
    showSuccess(toast, message);
    await timer(100);
  }
}

export async function showWarnings(
  toast: React.RefObject<Toast>,
  messages: string[]
) {
  for (const message of messages) {
    showWarning(toast, message);
    await timer(100);
  }
}

export async function showFailures(
  toast: React.RefObject<Toast>,
  messages: string[]
) {
  for (const message of messages) {
    showFailure(toast, message);
    await timer(100);
  }
}

// Iterates through error keys, and maps them to the appropriate success message in the map
export async function showSuccessesMapper(
  toast: React.RefObject<Toast>,
  keys: string[],
  map: Map<string, string>
) {
  for (const key of keys) {
    showSuccess(toast, map.get(key) ?? "Success");
    await timer(100);
  }
}

// Iterates through error keys, and maps them to the appropriate warning message in the map
export async function showWarningsMapper(
  toast: React.RefObject<Toast>,
  messages: string[],
  map: Map<string, string>
) {
  for (const key of messages) {
    showWarning(toast, map.get(key) ?? "Warning");
    await timer(100);
  }
}

// Iterates through error keys, and maps them to the appropriate error message in the map
export async function showFailuresMapper(
  toast: React.RefObject<Toast>,
  messages: string[],
  map: Map<string, string>
) {
  for (const key of messages) {
    showFailure(toast, map.get(key) ?? "Error Occurred");
    await timer(100);
  }
}

export async function showFailuresFunctionCaller(
  toast: React.RefObject<Toast>,
  messages: string[],
  func: (arg0: string) => string
) {
  for (const key of messages) {
    showFailure(toast, func(key));
    await timer(100);
  }
}
