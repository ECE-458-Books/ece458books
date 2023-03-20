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
    { label: "Small", value: SelectSizeDropdownOptions.Small },
    { label: "Normal", value: SelectSizeDropdownOptions.Normal },
    { label: "Large", value: SelectSizeDropdownOptions.Large },
  ]);

  return (
    <div className="flex">
      <label
        className="p-component p-text-secondary text-900 my-auto mr-1"
        htmlFor="whitespacedropdownselectorlabel"
      >
        Cell Padding
      </label>
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
