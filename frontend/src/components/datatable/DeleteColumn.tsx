import { Column } from "primereact/column";
import { DeleteTemplate } from "../../util/EditDeleteTemplate";

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
      style={{ width: "10%" }}
      hidden={props.hidden}
    ></Column>
  );
}