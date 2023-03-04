import { Button } from "primereact/button";
import React from "react";

interface DeleteTemplateProps<T> {
  onDelete: (arg0: T) => void;
  deleteDisabled?: (arg0: T) => boolean;
}

export default function DeleteTemplate<T>(props: DeleteTemplateProps<T>) {
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
