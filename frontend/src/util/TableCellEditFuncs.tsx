import { ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { internalToExternalDate } from "./DateOperations";
import { Image } from "primereact/image";

export const MAX_IMAGE_HEIGHT = 80;
export const MAX_IMAGE_WIDTH = 80;

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

export function percentEditor(
  value: number | undefined,
  onChange: (newValue: number) => void,
  disabled?: boolean
) {
  return (
    <InputNumber
      value={value}
      onValueChange={(e) => onChange(e.target.value ?? 0)}
      suffix="%"
      mode="decimal"
      maxFractionDigits={2}
      minFractionDigits={2}
      max={100}
      disabled={disabled ?? false}
    />
  );
}

export function percentBodyTemplate(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function priceBodyTemplate(value: number | bigint) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function imageBodyTemplate(thumbnailURL: string) {
  if (!thumbnailURL) {
    thumbnailURL = "http://books-db.colab.duke.edu/media/books/default.jpg";
  }
  return (
    <Image
      // Leaving this line in case of future image browser side caching workaround is needed
      src={`${thumbnailURL}${
        thumbnailURL.startsWith("https://books") ? "?" + Date.now() : ""
      }`}
      // src={thumbnailURL}
      id="imageONpage"
      alt="Image"
      imageStyle={{
        objectFit: "contain",
        maxHeight: MAX_IMAGE_HEIGHT,
        maxWidth: MAX_IMAGE_WIDTH,
      }}
      className="col-12 align-items-center flex justify-content-center"
    />
  );
}

export function dateBodyTemplate(date: Date) {
  return internalToExternalDate(date);
}
