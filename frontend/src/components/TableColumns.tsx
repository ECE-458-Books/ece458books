import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { ReactNode } from "react";

export interface ColumnStyle {
  minWidth?: string;
  width?: string;
}

// The base column interface, all columns should implement this interface
export interface TableColumn {
  // Base information
  field: string; // The key of the field. If the column is hidden, this is the only required field
  header?: string; // Displayed header on table
  hidden?: boolean; // Set to true if hiding column
  style?: ColumnStyle; // Used for setting width

  // Filter Information
  filterable?: boolean; // Set to true to enabling filter
  filterPlaceholder?: string; // Sets the filter placeholder
  customFilter?: JSX.Element; // Sets a custom filter

  // Sorting Information
  sortable?: boolean; // Set to true to enabling sorting

  // Editing/Custom Body Information
  cellEditValidator?: (event: ColumnEvent) => boolean; // Validator for cell editing
  cellEditor?: (options: ColumnEditorOptions) => ReactNode; // Cell editor
  customBody?: any; // Custom body
}

export function createColumns(columns: TableColumn[]) {
  const onCellEditComplete = (event: ColumnEvent) => {
    event.rowData[event.field] = event.newValue;
  };

  return columns.map((col) => {
    return (
      <Column
        // Indexing/header
        hidden={col.hidden ?? false}
        key={col.field}
        field={col.field}
        header={col.header}
        style={col.style ?? { minWidth: "16rem" }}
        // Filtering
        filter={col.filterable ?? false}
        filterElement={col.customFilter}
        filterMatchMode={"contains"}
        filterPlaceholder={col.filterPlaceholder}
        // Sorting
        sortable={col.sortable ?? false}
        sortField={col.field}
        // Hiding Fields
        showFilterMenuOptions={false}
        showClearButton={false}
        showApplyButton={false}
        showFilterMatchModes={false}
        showFilterOperator={false}
        // Editing/Body customization
        editor={col.cellEditor}
        cellEditValidator={col.cellEditValidator}
        onCellEditComplete={onCellEditComplete}
        body={col.customBody}
      />
    );
  });
}
