import { Button } from "primereact/button";

interface DeleteButtonProps {
  isEnabled?: boolean;
  onClick: () => void;
  className?: string;
}

export default function DeleteButton(props: DeleteButtonProps) {
  return (
    <>
      {(props.isEnabled ?? true) && (
        <Button
          type="button"
          label="Delete"
          icon="pi pi-trash"
          onClick={props.onClick}
          className={"p-button-sm my-auto p-button-danger " + props.className}
        />
      )}
    </>
  );
}
