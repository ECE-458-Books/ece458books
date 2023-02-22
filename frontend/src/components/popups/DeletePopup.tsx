import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import React from "react";

interface DeletePopupProps {
  deleteItemIdentifier: string;
  onConfirm: () => void;
  setIsVisible: (arg0: boolean) => void;
}

export default function DeletePopup(props: DeletePopupProps) {
  // Buttons that are shown on the bottom of the pop-up
  const deleteProductDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => props.setIsVisible(false)}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={props.onConfirm}
      />
    </React.Fragment>
  );
  return (
    <Dialog
      visible={true}
      style={{ width: "450px" }}
      header="Confirm"
      modal
      footer={deleteProductDialogFooter}
      onHide={() => props.setIsVisible(false)}
    >
      <div className="confirmation-content">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem" }}
        />
        {
          <span>
            Are you sure you want to delete {props.deleteItemIdentifier}?
          </span>
        }
      </div>
    </Dialog>
  );
}
