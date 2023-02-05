import { Button } from "primereact/button";
import React from "react";

interface EditDeleteTemplateProps<T> {
  onEdit: (arg0: T) => void;
  onDelete: (arg0: T) => void;
}

export default function EditDeleteTemplate<T>(
  props: EditDeleteTemplateProps<T>
) {
  return (rowData: T) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2"
          onClick={() => props.onEdit(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => props.onDelete(rowData)}
        />
      </React.Fragment>
    );
  };
}
