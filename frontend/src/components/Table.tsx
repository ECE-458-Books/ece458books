import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

export interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder: string;
  customFilter?: any;
  hidden?: boolean;
}

export interface TableProps<T extends object> {
  columns: Array<TableColumn>;
  data: Array<T>;
}

export default function Table<T extends object>(props: TableProps<T>) {
  const dynamicColumns = props.columns.map((col, i) => {
    return (
      <Column
        key={col.field}
        field={col.field}
        header={col.header}
        filter
        filterElement={col.customFilter}
        filterPlaceholder={col.filterPlaceholder}
        style={{ minWidth: "16rem" }}
        showClearButton={false}
        sortable
        hidden={col.hidden}
      />
    );
  });

  return (
    <DataTable value={props.data} responsiveLayout="scroll" filterDisplay="row">
      {dynamicColumns}
    </DataTable>
  );
}
