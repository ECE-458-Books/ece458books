import { Button } from "primereact/button";
import Restricted from "../../permissions/Restricted";

interface EditCancelButtonProps {
  onClickEdit: () => void;
  onClickCancel: () => void;
  isAddPage: boolean;
  isModifiable: boolean;
  className?: string;
}

export default function EditCancelButton(props: EditCancelButtonProps) {
  return (
    <Restricted to={"modify"}>
      {!props.isAddPage && !props.isModifiable && (
        <Button
          id="modifyBBToggle"
          name="modifyBBToggle"
          label="Edit"
          icon="pi pi-pencil"
          disabled={props.isAddPage}
          onClick={props.onClickEdit}
          className={props.className}
        />
      )}
      {!props.isAddPage && props.isModifiable && (
        <Button
          id="modifyBBToggle2"
          name="modifyBBToggle2"
          label="Cancel"
          icon="pi pi-times"
          className={"p-button-warning " + props.className}
          disabled={props.isAddPage}
          onClick={props.onClickCancel}
        />
      )}
    </Restricted>
  );
}
