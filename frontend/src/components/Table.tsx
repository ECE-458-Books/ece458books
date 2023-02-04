import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useState } from "react";

export interface TableColumn {
  field: string;
  header: string;
  filterPlaceholder?: string;
  customFilter?: any;
  hidden?: boolean;
}

export interface TableProps<T extends object> {
  columns: Array<TableColumn>;
  data: Array<T>;
}

export default function Table<T extends object>(props: TableProps<T>) {
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    // These need to be updated, this is copy pasted.
    // This entire file should probably be copied over into each of the list classes to make things easier.
    filters: {
      name: { value: "", matchMode: "contains" },
      "country.name": { value: "", matchMode: "contains" },
      company: { value: "", matchMode: "contains" },
      "representative.name": { value: "", matchMode: "contains" },
    },
  });

  const onTableComponentChange = (event: any) => {
    setLazyParams(event);
  };

  const dynamicColumns = props.columns.map((col) => {
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
    <DataTable
      value={props.data}
      responsiveLayout="scroll"
      filterDisplay="row"
      paginator
      paginatorTemplate="PrevPageLink NextPageLink"
      onPage={onTableComponentChange}
      onSort={onTableComponentChange}
    >
      {dynamicColumns}
    </DataTable>
  );
}
