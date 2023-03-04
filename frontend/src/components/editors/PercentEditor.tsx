import { InputNumber } from "primereact/inputnumber";

export function PercentEditor(
  value: number | undefined,
  onChange: (newValue: number | undefined) => void,
  className?: string,
  disabled?: boolean
) {
  return (
    <InputNumber
      value={value}
      onValueChange={(e) => onChange(e.target.value ?? undefined)}
      suffix="%"
      // mode="decimal"
      // maxFractionDigits={2}
      // minFractionDigits={2}
      className={className}
      max={100}
      disabled={disabled ?? false}
    />
  );
}
