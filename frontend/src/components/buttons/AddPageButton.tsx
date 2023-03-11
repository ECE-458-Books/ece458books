import { Button } from "primereact/button";

interface AddPageButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export default function AddPageButton(props: AddPageButtonProps) {
  return (
    <Button
      type="button"
      label={props.label}
      icon="pi pi-plus"
      onClick={props.onClick}
      iconPos="right"
      className={"p-button-sm my-auto " + props.className}
    />
  );
}
