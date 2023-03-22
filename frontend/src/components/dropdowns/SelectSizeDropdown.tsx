import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useState } from "react";

interface SelectSizeDropdownProps {
  value: SelectSizeDropdownOptions;
  onChange: (e: DropdownChangeEvent) => void;
  className?: string;
}

export enum SelectSizeDropdownOptions {
  Small = "small",
  Normal = "normal",
  Large = "large",
}

export default function SelectSizeDropdown(props: SelectSizeDropdownProps) {
  const [sizeOptions] = useState([
    { label: "Compact", value: SelectSizeDropdownOptions.Small },
    { label: "Standard", value: SelectSizeDropdownOptions.Normal },
    { label: "Comfortable", value: SelectSizeDropdownOptions.Large },
  ]);

  return (
    <div className="flex">
      <Dropdown
        value={props.value}
        onChange={props.onChange}
        options={sizeOptions}
        optionLabel="label"
        placeholder="Select a line padding"
        className={"" + props.className}
      />
    </div>
  );
}
