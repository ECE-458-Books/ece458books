import React from "react";
import Table, { TableColumn } from "../components/table";

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

const data: PurchaseOrderRow[] = [
  {
    date: "today",
    vendorName: "blah",
    uniqueBooks: 2,
    totalBooks: 2,
    totalCost: 2,
  },
];

const columns: TableColumn[] = [
  { field: "date", header: "Date" },
  { field: "vendorName", header: "Vendor Name" },
  { field: "uniqueBooks", header: "Unique Books" },
  { field: "totalBooks", header: "Total Books" },
  { field: "totalCost", header: "TotalCost" },
];

class PurchaseOrderPage extends React.Component<{}, PurchaseOrderListState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "" };
  }

  render() {
    return <Table<PurchaseOrderRow> columns={columns} data={data} />;
  }
}

export default PurchaseOrderPage;
