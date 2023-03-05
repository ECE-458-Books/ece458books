import { InputNumber } from "primereact/inputnumber";

export function NumberEditor(
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

export function NullableNumberEditor(
  value: number | undefined,
  onChange: (newValue: number | undefined) => void,
  className?: string,
  isDisabled?: boolean,
  min?: number,
  max?: number
) {
  return (
    <InputNumber
      min={min}
      max={max}
      value={value}
      disabled={isDisabled ?? false}
      className={className}
      onValueChange={(e) => onChange(e.target.value ?? undefined)}
      mode="decimal"
      maxFractionDigits={2}
    />
  );
}
