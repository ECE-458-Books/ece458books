import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";

export interface ConfirmButtonProps {
  className: string | undefined;
  id?: string;
  name?: string;
  isVisible: boolean;
  hideFunc: () => void;
  acceptFunc: () => void;
  rejectFunc: () => void;
  buttonClickFunc: () => void;
  disabled?: boolean;
  label: string;
  icons?: string;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <div>
      <ConfirmDialog
        id={"confirmButtonPopup" + props.id}
        visible={props.isVisible}
        onHide={props.hideFunc}
        message="Are you sure you want to proceed?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={props.acceptFunc}
        reject={props.rejectFunc}
      />
      <Button
        id={"enterfinalsubmission" + props.id}
        name={"confirmButtonPopup" + props.name}
        type="button"
        onClick={props.buttonClickFunc}
        disabled={props.disabled}
        label={props.label}
        className={props.className}
        icon={props.icons}
      />
    </div>
  );
}
