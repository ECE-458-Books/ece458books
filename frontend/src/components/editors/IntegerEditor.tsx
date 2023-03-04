import { InputNumber } from "primereact/inputnumber";

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

export function nullableIntegerEditor(
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
    />
  );
}
