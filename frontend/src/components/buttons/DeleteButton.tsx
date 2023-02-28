import { Button } from "primereact/button";

interface DeleteButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export default function DeleteButton(props: DeleteButtonProps) {
  return (
    <>
      {props.isEnabled && (
        <Button
          type="button"
          label="Delete"
          icon="pi pi-trash"
          onClick={props.onClick}
          className="p-button-sm my-auto ml-1 p-button-danger"
        />
      )}
    </>
  );
}