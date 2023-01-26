import BootstrapTable from "react-bootstrap-table-next";

export interface TableColumn {
  dataField: string;
  text: string;
}

export interface TableProps<T extends object> {
  columns: Array<TableColumn>;
  data: Array<T>;
}

export default function Table<T extends object>(props: TableProps<T>) {
  return (
    <BootstrapTable keyField="isbn" data={props.data} columns={props.columns} />
  );
}