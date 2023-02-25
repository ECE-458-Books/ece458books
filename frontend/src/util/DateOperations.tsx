export function externalToInternalDate(date: string) {
  return new Date(date.replace("-", "/"));
}

export function internalToExternalDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
