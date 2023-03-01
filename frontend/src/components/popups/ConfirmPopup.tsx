import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";

export interface ConfirmButtonProps {
  className?: string;
  classNameDiv?: string;
  id?: string;
  name?: string;
  isPopupVisible: boolean;
  isButtonVisible?: boolean;
  hideFunc: () => void;
  onFinalSubmission: () => void;
  onRejectFinalSubmission?: () => void;
  onShowPopup: () => void;
  disabled?: boolean;
  label: string;
  icons?: string;
}

export default function ConfirmButton(props: ConfirmButtonProps) {
  return (
    <div className={props.classNameDiv ?? ""}>
      <ConfirmDialog
        id={"confirmButtonPopup" + props.id}
        visible={props.isPopupVisible}
        onHide={props.hideFunc}
        message="Are you sure you want to proceed?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={props.onFinalSubmission}
        reject={props.onRejectFinalSubmission}
      />
      <Button
        id={"enterfinalsubmission" + props.id}
        name={"confirmButtonPopup" + props.name}
        type="button"
        onClick={props.onShowPopup}
        visible={props.isButtonVisible ?? true}
        disabled={props.disabled ?? false}
        label={props.label}
        className={props.className}
        icon={props.icons}
      />
    </div>
  );
}
