import React from "react";
import { InputText } from "primereact/inputtext";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  disabled: boolean;
  value: string;
}

export default function TextFieldLine(props: TextFieldProps) {
  return (
    <div>
      <label htmlFor="username">{props.label}</label>
      <InputText
        id={props.id}
        className="p-inputtext-sm"
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        aria-describedby="username-help"
      />
    </div>
  );
}
