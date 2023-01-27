import { DataTable } from "primereact/datatable";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Dropdown } from "primereact/dropdown";
import { GENRE_DATA } from "../pages/GenreList";

const genreFilter = (options: ColumnFilterElementTemplateOptions) => {
  return (
    <Dropdown
      value={options.value}
      options={GENRE_DATA.map((genreRow) => genreRow.genre)}
      onChange={(e) => options.filterApplyCallback(e.value)}
      placeholder={"Select Genre"}
    />
  );
};

export interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder: string;
  customFilter?: any;
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
        filterPlaceholder={col.filterPlaceholder}
        style={{ minWidth: "10rem" }}
      />
    );
  });

  return (
    <DataTable value={props.data} responsiveLayout="scroll" filterDisplay="row">
      {dynamicColumns}
    </DataTable>
  );
}
