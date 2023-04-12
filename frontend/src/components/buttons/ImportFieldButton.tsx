import { Button } from "primereact/button";
import { TooltipOptions } from "primereact/tooltip/tooltipoptions";
import { CSSProperties } from "react";
import "../../css/TableCell.css";

export interface ImportFieldButtonProps {
  onClick: () => void;
  isVisible: boolean;
  isDisabled: boolean;
  style?: CSSProperties;
  className?: string;
  tooltip?: string;
  tooltipOptions?: TooltipOptions;
}

export default function ImportFieldButton(props: ImportFieldButtonProps) {
  return (
    <Button
      icon="pi pi-fw pi-file-import"
      type="button"
      className={props.className}
      style={props.style ?? { height: 20, width: 25 }}
      onClick={props.onClick}
      visible={props.isVisible}
      disabled={props.isDisabled}
      tooltip={props.tooltip}
      tooltipOptions={props.tooltipOptions}
    />
  );
}
