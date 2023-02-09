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

export function priceBodyTemplateWholesale(rowData: {
  unit_wholesale_price: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.unit_wholesale_price);
}

export function priceBodyTemplateRetailPrice(rowData: {
  retailPrice: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.retailPrice);
}

export function priceBodyTemplateUnit(rowData: {
  unit_retail_price: number | bigint;
}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(rowData.unit_retail_price);
}
