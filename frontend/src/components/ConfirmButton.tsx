import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";

export interface ConfirmButtonProps {
  className: string | undefined;
  isVisible: boolean;
  hideFunc: () => void;
  acceptFunc: () => void;
  rejectFunc: () => void;
  buttonClickFunc: () => void;
  disabled: boolean;
  label: string;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <div>
      <ConfirmDialog
        id="confirmButtonPopup"
        visible={props.isVisible}
        onHide={props.hideFunc}
        message="Are you sure you want to proceed?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={props.acceptFunc}
        reject={props.rejectFunc}
      />
      <Button
        id="enterfinalsubmission"
        type="button"
        onClick={props.buttonClickFunc}
        disabled={props.disabled}
        label={props.label}
        className={props.className}
      />
    </div>
  );
}
