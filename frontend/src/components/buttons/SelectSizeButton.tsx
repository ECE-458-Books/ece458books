import { SelectButton } from "primereact/selectbutton";
import { useState } from "react";

interface SelectSizeButtonProps {
  value: any;
  onChange: (e: any) => void;
  className?: string;
}

export default function SelectSizeButton(props: SelectSizeButtonProps) {
  const [sizeOptions] = useState([
    { label: "Small", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Large", value: "large" },
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
