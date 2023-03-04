import { internalToExternalDate } from "../../util/DateOps";

export function DateTemplate(date: Date) {
  return internalToExternalDate(date);
}
