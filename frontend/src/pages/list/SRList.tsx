import React from "react";
import Table, { TableColumn } from "../../components/Table";

interface SalesReconciliationListState {
  value: string;
}

export interface SalesReconciliation {
  id: number;
  date: string;
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

const DATA: SalesReconciliation[] = [
  {
    id: 0,
    date: "today",
    uniqueBooks: 2,
    totalBooks: 2,
    totalRevenue: 2,
  },
];

const COLUMNS: TableColumn[] = [
  { field: "date", header: "Date", filterPlaceholder: "Search by Total Date" },
  {
    field: "uniqueBooks",
    header: "Unique Books",
    filterPlaceholder: "Search by Unique Books",
  },
  {
    field: "totalBooks",
    header: "Total Books",
    filterPlaceholder: "Search by Total Books",
  },
  {
    field: "totalRevenue",
    header: "Total Cost",
    filterPlaceholder: "Search by Total Revenue",
  },
];

class SalesReconciliationList extends React.Component<
  {},
  SalesReconciliationListState
> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<SalesReconciliation> columns={COLUMNS} data={DATA} />;
  }
}

export default SalesReconciliationList;
