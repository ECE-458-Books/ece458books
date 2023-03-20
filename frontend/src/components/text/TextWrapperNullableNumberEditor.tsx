import { NullableNumberEditor } from "../editors/NumberEditor";

interface TextWrapperNullableNumberEditorProps {
  disabled: boolean;
  textValue: string | number | undefined;
  value: number | undefined;
  onValueChange: (newValue: number | undefined) => void;
  valueClassName?: string;
  defaultValue: number | undefined;
}

export function TextWrapperNullableNumberEditor(
  props: TextWrapperNullableNumberEditorProps
) {
  return (
    <>
      {props.disabled ? (
        <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
          {props.textValue}
        </p>
      ) : (
        <div className={props.valueClassName ?? ""}>
          {NullableNumberEditor(
            props.value,
            (newValue: number | undefined) =>
              props.onValueChange(newValue ?? props.defaultValue),
            "w-4",
            props.disabled
          )}
        </div>
      )}
    </>
  );
}
