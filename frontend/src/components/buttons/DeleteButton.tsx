import { Button } from "primereact/button";
import Restricted from "../../permissions/Restricted";

interface DeleteButtonProps {
  className?: string;
  onClick: () => void;
  visible?: boolean;
  disabled?: boolean;
  disableUserRestriction?: boolean;
}

export default function DeleteButton(props: DeleteButtonProps) {
  return (
    <Restricted to={"delete"} disabled={props.disableUserRestriction}>
      <Button
        type="button"
        label="Delete"
        disabled={props.disabled ?? false}
        visible={props.visible ?? true}
        icon="pi pi-trash"
        onClick={props.onClick}
        className={"p-button-sm my-auto p-button-danger " + props.className}
      />
    </Restricted>
  );
}
