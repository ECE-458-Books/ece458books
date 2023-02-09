export function toYYYYMMDDWithDash(date: Date) {
  return date.toISOString().slice(0, 10);
}
