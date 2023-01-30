import React from "react";
import { useState } from "react";
import { ToggleButton } from "primereact/togglebutton";

interface ToggleButtonProps {
  id: string;
  name: string;
  checkedOut: boolean;
}

export default function ToggleEditButton(props: ToggleButtonProps) {
  const [checked, setChecked] = useState(false);

  return (
    <ToggleButton
      id={props.id}
      name={props.name}
      onLabel="Modifiable"
      offLabel="Modify"
      onIcon="pi pi-check"
      offIcon="pi pi-times"
      checked={checked}
      onChange={(e) => setChecked(e.value)}
    />
  );
}
