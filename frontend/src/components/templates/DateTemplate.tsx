import {
  internalToExternalDate,
  internalToExternalDateTime,
} from "../../util/DateOps";

export function DateTemplate(date: Date) {
  return internalToExternalDate(date);
}

export function DateTimeTemplate(date: Date) {
  return internalToExternalDateTime(date);
}
