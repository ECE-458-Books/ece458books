import { InputText } from "primereact/inputtext";

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
