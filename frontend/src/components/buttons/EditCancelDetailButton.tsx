import { Button } from "primereact/button";

interface EditCancelButtonProps {
  onClickEdit: () => void;
  onClickCancel: () => void;
  isAddPage: boolean;
  isModifiable: boolean;
}

export default function EditCancelButton(props: EditCancelButtonProps) {
  return (
    <>
      {!props.isAddPage && !props.isModifiable && (
        <Button
          id="modifyBBToggle"
          name="modifyBBToggle"
          label="Edit"
          icon="pi pi-pencil"
          disabled={props.isAddPage}
          onClick={props.onClickEdit}
        />
      )}
      {!props.isAddPage && props.isModifiable && (
        <Button
          id="modifyBBToggle2"
          name="modifyBBToggle2"
          label="Cancel"
          icon="pi pi-times"
          className="p-button-warning"
          disabled={props.isAddPage}
          onClick={props.onClickCancel}
        />
      )}
    </>
  );
}
