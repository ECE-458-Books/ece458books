import { internalToExternalDate } from "../../util/DateOps";

export function DateBodyTemplate(date: Date) {
  return internalToExternalDate(date);
}
