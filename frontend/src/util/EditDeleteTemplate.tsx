import { Button } from "primereact/button";
import React from "react";

// This will be removed soon, as we will no longer have edit buttons
interface EditDeleteTemplateProps<T> {
  onEdit: (arg0: T) => void;
  onDelete: (arg0: T) => void;
  deleteDisabled: (arg0: T) => boolean;
}

interface DeleteTemplateProps<T> {
  onDelete: (arg0: T) => void;
  deleteDisabled?: (arg0: T) => boolean;
}

export function DeleteTemplate<T>(props: DeleteTemplateProps<T>) {
  return (rowData: T) => {
    return (
      <React.Fragment>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => props.onDelete(rowData)}
          disabled={props.deleteDisabled?.(rowData) ?? false}
        />
      </React.Fragment>
    );
  };
}

export default function EditDeleteTemplate<T>(
  props: EditDeleteTemplateProps<T>
) {
  return (rowData: T) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2 h-auto w-5"
          onClick={() => props.onEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger h-auto w-5"
          onClick={() => props.onDelete(rowData)}
          disabled={props.deleteDisabled(rowData)}
        />
      </React.Fragment>
    );
  };
}
