import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions, ColumnEvent } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { ReactNode } from "react";

// The base column interface, all columns should implement this interface
export interface TableColumn {
  // Base information
  field: string; // The key of the field. If the column is hidden, this is the only required field
  header?: string; // Displayed header on table
  hidden?: boolean; // Set to true if hiding column

  // Filter Information
  filterable?: boolean; // Set to true to enabling filter
  filterPlaceholder?: string; // Sets the filter placeholder
  customFilter?: () => JSX.Element; // Sets a custom filter

  // Sorting Information
  sortable?: boolean; // Set to true to enabling sorting

  // Editing/Custom Body Information
  cellEditValidator?: (event: ColumnEvent) => boolean; // Validator for cell editing
  cellEditor?: (options: ColumnEditorOptions) => ReactNode; // Cell editor
  onCellEditComplete?: (event: ColumnEvent) => void; // Callback for cell editing
  customBody?: any; // Custom body
}

export function createColumns(columns: TableColumn[]) {
  return columns.map((col) => {
    return (
      <Column
        // Indexing/header
        hidden={col.hidden ?? false}
        key={col.field}
        field={col.field}
        header={col.header}
        style={{ minWidth: "16rem" }}
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
        onCellEditComplete={col.onCellEditComplete}
        body={col.customBody}
      />
    );
  });
}

export interface TableProps<T extends object> {
  columns: Array<TableColumn>;
  data: Array<T>;
}

export default function Table<T extends object>(props: TableProps<T>) {
  const dynamicColumns = props.columns.map((col) => {
    return (
      <Column
        // Indexing/header
        key={col.field}
        field={col.field}
        header={col.header}
        // Filtering
        filter
        filterElement={col.customFilter}
        filterMatchMode={"contains"}
        filterPlaceholder={col.filterPlaceholder}
        // Sorting
        sortable
        sortField={col.field}
        // Hiding Fields
        showFilterMenuOptions={false}
        showClearButton={false}
        // Other
        style={{ minWidth: "16rem" }}
        hidden={col.hidden}
      />
    );
  });

  return (
    <DataTable
      value={props.data}
      responsiveLayout="scroll"
      filterDisplay="row"
      paginator
      rows={10}
      paginatorTemplate="PrevPageLink NextPageLink"
    >
      {dynamicColumns}
    </DataTable>
  );
}
