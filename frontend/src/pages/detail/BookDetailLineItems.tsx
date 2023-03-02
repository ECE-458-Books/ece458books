import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { createColumns, TableColumn } from "../../components/TableColumns";
import { logger } from "../../util/Logger";
import { dateBodyTemplate, priceBodyTemplate } from "../../util/TableCellEditFuncs";
import { Book } from "../list/BookList";

export interface BookDetailLineItemsProps {
  lineItems: BookDetailLineItem[];
}

export interface BookDetailLineItem {
  id: string;
  date: Date;
  type: BookDetailLineItemType;
  vendor?: number;
  vendorName?: string;
  price: number;
  quantity: number;
}

export enum BookDetailLineItemType {
  PURCHASE_ORDER = "Purchase Order",
  SALES_RECONCILIATION = "Sales Reconciliation",
  BOOK_BUYBACK = "Book Buyback",
}

// Line item navigation mapper
export const LineItemURLMapper = new Map<BookDetailLineItemType, string>([
  [BookDetailLineItemType.PURCHASE_ORDER, "purchase-orders"],
  [BookDetailLineItemType.SALES_RECONCILIATION, "sales-reconciliations"],
  [BookDetailLineItemType.BOOK_BUYBACK, "book-buybacks"],
]);

export default function BookDetailLineItems(props: BookDetailLineItemsProps) {
  const navigate = useNavigate();

  const COLUMNS: TableColumn[] = [
    {
      header: "Date",
      field: "date",
      customBody: (rowData: BookDetailLineItem) =>
        dateBodyTemplate(rowData.date),
      style: { minWidth: "8rem", width: "8rem" },
    },
    {
      header: "Type",
      field: "type",
      style: { minWidth: "8rem", width: "12rem" },
    },
    {
      header: "Vendor",
      field: "vendorName",
      style: { minWidth: "8rem", width: "22rem" },
    },
    {
      header: "Price",
      field: "price",
      customBody: (rowData: Book) => priceBodyTemplate(rowData.price),
      style: { minWidth: "6rem", width: "10rem" },
    },
    {
      header: "Quantity",
      field: "quantity",
      style: { minWidth: "6rem", width: "8rem" },
    },
  ];

  const onRowClick = (event: DataTableRowClickEvent) => {
    const lineItem = event.data as BookDetailLineItem;
    logger.debug("Line Item Clicked (Book Detail View)", lineItem);
    const urlExtension = LineItemURLMapper.get(lineItem.type);
    navigate(`/${urlExtension}/detail/${lineItem.id}`);
  };

  const columns = createColumns(COLUMNS);
  return (
    <DataTable
      onRowClick={onRowClick}
      rowHover
      size="small"
      value={props.lineItems}
    >
      {columns}
    </DataTable>
  );
}
