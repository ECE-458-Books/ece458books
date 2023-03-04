import { Column } from "primereact/column";
import DeleteTemplate from "../templates/DeleteButton";

interface DeleteColumnProps<T> {
  onDelete: (arg0: T) => void;
  deleteDisabled?: (arg0: T) => boolean;
  hidden?: boolean;
}

export default function DeleteColumn<T>(props: DeleteColumnProps<T>) {
  // Delete icon for each row
  const rowDeleteButton = DeleteTemplate<T>({
    onDelete: props.onDelete,
    deleteDisabled: props.deleteDisabled,
  });

  return (
    <Column
      body={rowDeleteButton}
      header={"Delete"}
      exportable={false}
      style={{ width: "2rem" }}
      hidden={props.hidden}
    ></Column>
  );
}
