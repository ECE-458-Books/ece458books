import React from "react";
import Table, { TableColumn } from "../components/Table";

interface SalesReconciliationListState {
  value: string;
}

interface SalesReconciliationRow {
  date: string;
  uniqueBooks: number;
  totalBooks: number;
  totalRevenue: number;
}

const data: SalesReconciliationRow[] = [
  {
    date: "today",
    uniqueBooks: 2,
    totalBooks: 2,
    totalRevenue: 2,
  },
];

const columns: TableColumn[] = [
  { field: "date", header: "Date" },
  { field: "uniqueBooks", header: "Unique Books" },
  { field: "totalBooks", header: "Total Books" },
  { field: "totalRevenue", header: "TotalCost" },
];

class SalesReconciliationPage extends React.Component<
  {},
  SalesReconciliationListState
> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<SalesReconciliationRow> columns={columns} data={data} />;
  }
}

export default SalesReconciliationPage;
