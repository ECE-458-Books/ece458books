import { Button } from "primereact/button";
import React, { CSSProperties } from "react";

interface DeleteTemplateProps<T> {
  onDelete: (arg0: T) => void;
  deleteDisabled?: (arg0: T) => boolean;
  style?: CSSProperties;
}

export default function DeleteTemplate<T>(props: DeleteTemplateProps<T>) {
  return (rowData: T) => {
    return (
      <>
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          style={props.style}
          onClick={() => props.onDelete(rowData)}
          disabled={props.deleteDisabled?.(rowData) ?? false}
        />
      </>
    );
  };
}
