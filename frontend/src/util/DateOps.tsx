import { format } from "date-fns";

export function externalToInternalDate(date: string) {
  return new Date(date.replace("-", "/"));
}

export function internalToExternalDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function internalToExternalDateTime(date: Date) {
  return format(date, "MMMM do, yyyy hh:mma");
}
