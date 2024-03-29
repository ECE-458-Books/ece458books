import { Button } from "primereact/button";
import Restricted from "../../permissions/Restricted";

interface AddPageButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
  disableUserRestriction?: boolean;
}

export default function AddPageButton(props: AddPageButtonProps) {
  return (
    <Restricted to={"add"} disabled={props.disableUserRestriction}>
      <Button
        type="button"
        label={props.label}
        icon="pi pi-plus"
        onClick={props.onClick}
        iconPos="right"
        className={"p-button-sm " + props.className}
      />
    </Restricted>
  );
}
