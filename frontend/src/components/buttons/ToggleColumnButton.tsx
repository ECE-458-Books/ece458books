import { Button } from "primereact/button";

interface ToggleColumnButtonProps {
  className?: string;
  onClick: () => void;
}

export default function ToggleColumnButton(props: ToggleColumnButtonProps) {
  return (
    <Button
      type="button"
      label="Toggle Columns"
      onClick={props.onClick}
      className={"p-button-info p-button-sm " + props.className}
    />
  );
}
