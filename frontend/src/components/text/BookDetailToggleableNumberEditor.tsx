import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";

interface BookDetailToggleableNumberEditorProps {
  disabled: boolean;
  textValue: string | number | undefined;
  value: number | null | undefined;
  onValueChange: (newValue: number | undefined) => void;
  valueClassName?: string;
  defaultValue: number | undefined;
  mode?: InputNumberModeOptions;
  currency?: string;
  locale?: string;
}

export enum InputNumberModeOptions {
  Currency = "currency",
  Decimal = "decimal",
}

export function BookDetailToggleableNumberEditor(
  props: BookDetailToggleableNumberEditorProps
) {
  return (
    <>
      {props.disabled ? (
        <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
          {props.textValue}
        </p>
      ) : (
        <div className={props.valueClassName ?? ""}>
          <InputNumber
            id={props.textValue?.toString()}
            className="w-4"
            name={props.textValue?.toString()}
            value={props.value}
            mode={props.mode ?? undefined}
            currency={props.currency ?? undefined}
            locale={props.locale ?? undefined}
            maxFractionDigits={2}
            disabled={props.disabled}
            onValueChange={(e: InputNumberValueChangeEvent) =>
              props.onValueChange(e.value ?? props.defaultValue)
            }
          />
        </div>
      )}
    </>
  );
}
