import { ColumnEditorOptions } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";

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

export function textEditor(options: ColumnEditorOptions) {
  return (
    <InputText
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback?.(e.target.value)}
    />
  );
}

export function numberEditor(options: ColumnEditorOptions) {
  return (
    <InputNumber
      autoFocus
      value={options.value}
      onValueChange={(e) => options.editorCallback?.(e.target.value)}
      mode="decimal"
      maxFractionDigits={2}
    />
  );
}

export function priceEditor(options: ColumnEditorOptions) {
  return (
    <InputNumber
      value={options.value}
      onValueChange={(e) => options.editorCallback?.(e.target.value)}
      mode="currency"
      currency="USD"
      locale="en-US"
    />
  );
}

export function priceBodyTemplate(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function priceBodyTemplateWholesale(rowData: {
  unitWholesalePrice: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.unitWholesalePrice);
}

export function priceBodyTemplateRetailPrice(rowData: {
  unitRetailPrice: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.unitRetailPrice);
}

export function priceBodyTemplateSubtotal(rowData: {
  subtotal: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.subtotal);
}

export function priceBodyTemplateUnit(rowData: {
  unitRetailPrice: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.unitRetailPrice);
}
