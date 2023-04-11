import { Button } from "primereact/button";
import { CSSProperties } from "react";
import "../../css/TableCell.css";

export interface ImportFieldButtonProps {
  onClick: () => void;
  isVisible: boolean;
  isDisabled: boolean;
  style?: CSSProperties;
  className?: string;
}

export default function ImportFieldButton(props: ImportFieldButtonProps) {
  return (
    <Button
      className={props.className}
      icon="pi pi-fw pi-file-import"
      style={props.style ?? { height: 20, width: 25 }}
      onClick={props.onClick}
      visible={props.isVisible}
      type="button"
      disabled={props.isDisabled}
    />
  );
}
