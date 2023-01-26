import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";

export interface TableColumn {
  field: string;
  header: string;
}

export interface TableProps<T extends object> {
  columns: Array<TableColumn>;
  data: Array<T>;
}

export default function Table<T extends object>(props: TableProps<T>) {
  const columns = props.columns.map((col, i) => {
    return <Column key={col.field} field={col.field} header={col.header} />;
  });

  return <DataTable value={props.data}>{columns}</DataTable>;
}
