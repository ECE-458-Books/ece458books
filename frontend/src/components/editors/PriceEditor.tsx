import { InputNumber } from "primereact/inputnumber";

export const MAX_IMAGE_HEIGHT = 50;
export const MAX_IMAGE_WIDTH = 50;

export function PriceEditor(
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
