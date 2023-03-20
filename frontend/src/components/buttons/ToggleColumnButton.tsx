import { Button } from "primereact/button";
import Restricted from "../../permissions/Restricted";

interface ToggleColumnButtonProps {
  className?: string;
  onClick: () => void;
}

export default function ToggleColumnButton(props: ToggleColumnButtonProps) {
  return (
    <Restricted to={"delete"}>
      <Button
        type="button"
        label="Toggle Columns"
        onClick={props.onClick}
        className={"p-button-info p-button-sm " + props.className}
      />
    </Restricted>
  );
}
