import { Button } from "primereact/button";

interface DeleteButtonProps {
  className?: string;
  onClick: () => void;
  visible?: boolean;
  disabled?: boolean;
}

export default function DeleteButton(props: DeleteButtonProps) {
  return (
    <>
      <Button
        type="button"
        label="Delete"
        disabled={props.disabled ?? false}
        visible={props.visible ?? true}
        icon="pi pi-trash"
        onClick={props.onClick}
        className={"p-button-sm my-auto p-button-danger " + props.className}
      />
    </>
  );
}
