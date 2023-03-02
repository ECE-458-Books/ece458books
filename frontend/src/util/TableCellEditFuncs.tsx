import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { internalToExternalDate } from "./DateOperations";
import { Image } from "primereact/image";
import { DEFAULT_BOOK_IMAGE } from "../components/uploaders/ImageFileUploader";

export const MAX_IMAGE_HEIGHT = 50;
export const MAX_IMAGE_WIDTH = 50;

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

export function textEditor(
  value: string,
  onChange: (newValue: string) => void,
  className?: string,
  isDisabled?: boolean
) {
  return (
    <InputText
      type="text"
      value={value}
      disabled={isDisabled ?? false}
      className={className}
      onChange={(e) => onChange(e.target.value ?? "")}
    />
  );
}

export function integerEditor(
  value: number | undefined,
  onChange: (newValue: number) => void,
  className?: string,
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
      className={className}
      onValueChange={(e) => onChange(e.target.value ?? 1)}
    />
  );
}

export function numberEditor(
  value: number | undefined,
  onChange: (newValue: number) => void,
  className?: string,
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
      className={className}
      onValueChange={(e) => onChange(e.target.value ?? 1)}
      mode="decimal"
      maxFractionDigits={2}
    />
  );
}

export function priceEditor(
  value: number,
  onChange: (newValue: number) => void,
  className?: string,
  isDisabled?: boolean
) {
  return (
    <InputNumber
      value={value}
      onValueChange={(e) => onChange(e.target.value ?? 0)}
      disabled={isDisabled ?? false}
      maxFractionDigits={2}
      className={className}
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
  className?: string,
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
      className={className}
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

export function priceBodyTemplate(value: number | bigint | undefined) {
  if (value == null) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function imageBodyTemplate(thumbnailURL: string) {
  if (!thumbnailURL) {
    thumbnailURL = DEFAULT_BOOK_IMAGE;
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
      className="flex justify-content-center"
      imageClassName="shadow-2 border-round"
    />
  );
}

export function imageBodyTemplateWithButtons(
  deleteButton: JSX.Element,
  uploadButton: JSX.Element,
  thumbnailURL: string
) {
  if (!thumbnailURL) {
    thumbnailURL = DEFAULT_BOOK_IMAGE;
  }
  return (
    <>
      <div className="flex justify-content-center">
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
        />
      </div>
      <div className="flex justify-content-between">
        {uploadButton}
        {deleteButton}
      </div>
    </>
  );
}

export function dateBodyTemplate(date: Date) {
  return internalToExternalDate(date);
}
