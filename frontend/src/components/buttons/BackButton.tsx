import { Button } from "primereact/button";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export default function BackButton(props: BackButtonProps) {
  return (
    <Button
      type="button"
      label="List"
      icon="pi pi-arrow-left"
      onClick={props.onClick}
      className={"p-button-sm my-auto " + props.className}
    />
  );
}
