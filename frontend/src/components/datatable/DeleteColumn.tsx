import { Column } from "primereact/column";
import DeleteTemplate from "../templates/DeleteButton";
import { CSSProperties } from "react";

interface DeleteColumnProps<T> {
  onDelete: (arg0: T) => void;
  deleteDisabled?: (arg0: T) => boolean;
  hidden?: boolean;
  style?: CSSProperties;
  buttonStyle?: CSSProperties;
  hideHeader?: boolean;
}

export default function DeleteColumn<T>(props: DeleteColumnProps<T>) {
  // Delete icon for each row
  const rowDeleteButton = DeleteTemplate<T>({
    onDelete: props.onDelete,
    deleteDisabled: props.deleteDisabled,
    style: props.buttonStyle,
  });

  return (
    <Column
      body={rowDeleteButton}
      header={props.hideHeader ? "" : "Delete"}
      exportable={false}
      style={props.style ?? { width: "2rem" }}
      hidden={props.hidden}
    ></Column>
  );
}
