import { ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { internalToExternalDate } from "./DateOperations";

export const MAX_IMAGE_HEIGHT = 100;
export const MAX_IMAGE_WIDTH = 100;

//Clean the incoming number input (integer or decimal)
//Convert to string and correct any issues with the input number.
//Check value of the number to ensure it a posive value and exists.
export function isPositiveInteger(val: number) {
  let str = String(val);

  str = str.trim();

  if (!str) {
    return false;
  }

  str = str.replace(/^0+/, "") || "0";
  const n = Number(str);

  return n !== Infinity && String(n) === str && n >= 0;
}

export function textEditor(options: ColumnEditorOptions, isDisabled?: boolean) {
  return (
    <InputText
      type="text"
      value={options.value}
      disabled={isDisabled ?? false}
      onChange={(e) => options.editorCallback?.(e.target.value)}
    />
  );
}

export function numberEditor(
  value: number,
  onChange: (newValue: number) => void,
  isDisabled?: boolean,
  min?: number,
  max?: number
) {
  return (
    <InputNumber
      min={min ?? 1}
      max={max}
      value={value}
      disabled={isDisabled ?? false}
      onValueChange={(e) => onChange(e.target.value ?? 1)}
      mode="decimal"
      maxFractionDigits={2}
    />
  );
}

export function priceEditor(
  value: number,
  onChange: (newValue: number) => void,
  isDisabled?: boolean
) {
  return (
    <InputNumber
      value={value}
      onValueChange={(e) => onChange(e.target.value ?? 0)}
      disabled={isDisabled ?? false}
      mode="currency"
      currency="USD"
      locale="en-US"
      autoFocus={true}
    />
  );
}

export function priceBodyTemplate(value: number | bigint) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function imageBodyTemplate(thumbnailURL: string[]) {
  return (
    <img
      // Change the [0] when implementing for multiple images
      src={thumbnailURL[0]}
      alt="Image"
      className="product-image"
      style={{
        objectFit: "contain",
        maxHeight: MAX_IMAGE_HEIGHT,
        maxWidth: MAX_IMAGE_WIDTH,
      }}
    />
  );
}

export function dateBodyTemplate(date: Date) {
  return internalToExternalDate(date);
}
