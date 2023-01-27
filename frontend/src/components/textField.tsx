import React from "react";
import { InputText } from "primereact/inputtext";

export interface TextFieldValues {
  field: string;
  label: string;
}

interface TextFieldProps {
  label: string;
  placeholder: string;
  disabled: boolean;
}

export default function TextFieldLine(props: TextFieldProps) {
  return (
    <div>
      <label htmlFor="username">{props.label}</label>
      <InputText
        id="username"
        className="p-inputtext-sm"
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-describedby="username-help"
      />
    </div>
  );
}
