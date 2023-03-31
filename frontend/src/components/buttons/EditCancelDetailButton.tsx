import { Button } from "primereact/button";
import Restricted from "../../permissions/Restricted";

interface EditCancelButtonProps {
  onClickEdit: () => void;
  onClickCancel: () => void;
  isAddPage: boolean;
  isModifiable: boolean;
  className?: string;
  disableUserRestriction?: boolean;
  visible?: boolean;
}

export default function EditCancelButton(props: EditCancelButtonProps) {
  return (
    <Restricted to={"modify"} disabled={props.disableUserRestriction}>
      {!props.isAddPage && !props.isModifiable && (
        <Button
          id="modifyBBToggle"
          name="modifyBBToggle"
          label="Edit"
          icon="pi pi-pencil"
          disabled={props.isAddPage}
          onClick={props.onClickEdit}
          className={props.className}
          visible={props.visible}
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
          visible={props.visible}
        />
      )}
    </Restricted>
  );
}
