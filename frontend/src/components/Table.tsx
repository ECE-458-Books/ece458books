import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

export interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder?: string;
  customFilter?: any;
  hidden?: boolean;
  sortable?: boolean;
  filterable?: boolean;
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
