import { Button } from "primereact/button";

export interface ImportFieldButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function ImportFieldButton(props: ImportFieldButtonProps) {
  return (
    <Button
      className="ml-2"
      icon="pi pi-fw pi-upload"
      style={{ height: 20, width: 25 }}
      onClick={props.onClick}
      visible={props.isVisible}
      type="button"
    />
  );
}
