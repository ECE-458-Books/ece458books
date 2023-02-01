import React from "react";
import Table, { TableColumn } from "../components/Table";

interface PurchaseOrderListState {
  value: string;
}

interface PurchaseOrderRow {
  date: string;
  vendorName: string;
  uniqueBooks: number;
  totalBooks: number;
  totalCost: number;
}

const DATA: PurchaseOrderRow[] = [
  {
    date: "today",
    vendorName: "blah",
    uniqueBooks: 2,
    totalBooks: 2,
    totalCost: 2,
  },
];

const COLUMNS: TableColumn[] = [
  { field: "date", header: "Date", filterPlaceholder: "Search by Date" },
  {
    field: "vendorName",
    header: "Vendor Name",
    filterPlaceholder: "Search by Name",
  },
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
    field: "totalCost",
    header: "TotalCost",
    filterPlaceholder: "Search by Total Cost",
  },
];

class PurchaseOrderList extends React.Component<{}, PurchaseOrderListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<PurchaseOrderRow> columns={COLUMNS} data={DATA} />;
  }
}

export default PurchaseOrderList;
