import { SelectButton } from "primereact/selectbutton";
import { useState } from "react";

interface SelectSizeButtonProps {
  value: SelectSizeButtonOptions;
  onChange: (e: any) => void;
  className?: string;
}

export enum SelectSizeButtonOptions {
  Small = "small",
  Normal = "normal",
  Large = "large",
}

export default function SelectSizeButton(props: SelectSizeButtonProps) {
  const [sizeOptions] = useState([
    { label: "Small", value: SelectSizeButtonOptions.Small },
    { label: "Normal", value: SelectSizeButtonOptions.Normal },
    { label: "Large", value: SelectSizeButtonOptions.Large },
  ]);

  return (
    <SelectButton
      value={props.value}
      onChange={props.onChange}
      options={sizeOptions}
      className={"" + props.className}
    />
  );
}
