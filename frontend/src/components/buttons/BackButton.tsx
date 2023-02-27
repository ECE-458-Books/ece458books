import { Button } from "primereact/button";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton(props: BackButtonProps) {
  return (
    <div className="flex col-1">
      <Button
        type="button"
        label="Back"
        icon="pi pi-arrow-left"
        onClick={props.onClick}
        className="p-button-sm my-auto ml-1"
      />
    </div>
  );
}
