import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import { logger } from "../../util/Logger";
import { DateTemplate } from "../../components/templates/DateTemplate";
import PriceTemplate from "../../components/templates/PriceTemplate";

export interface BookDetailLineItemsProps {
  lineItems: BookDetailLineItem[];
  disableRowClick?: boolean;
}

export interface BookDetailLineItem {
  id: string;
  date: Date;
  type: BookDetailLineItemType;
  vendor?: number;
  vendorName?: string;
  creatorName?: string;
  price: number;
  quantity: number;
  stock: number;
}

export enum BookDetailLineItemType {
  PURCHASE_ORDER = "Purchase Order",
  SALES_RECORD = "Sales Record",
  SALES_RECONCILIATION = "Sales Reconciliation",
  BOOK_BUYBACK = "Book Buyback",
  INVENTORY_CORRECTION = "Inventory Correction",
}

// Line item navigation mapper
export const LineItemURLMapper = new Map<BookDetailLineItemType, string>([
  [BookDetailLineItemType.PURCHASE_ORDER, "purchase-orders"],
  [BookDetailLineItemType.SALES_RECORD, "sales-records"],
  [BookDetailLineItemType.SALES_RECONCILIATION, "sales-records"],
  [BookDetailLineItemType.BOOK_BUYBACK, "book-buybacks"],
]);

export default function BookDetailLineItems(props: BookDetailLineItemsProps) {
  const navigate = useNavigate();

  const COLUMNS: TableColumn<BookDetailLineItem>[] = [
    {
      header: "Date",
      field: "date",
      customBody: (rowData: BookDetailLineItem) => DateTemplate(rowData.date),
      style: { minWidth: "8rem", width: "8rem" },
    },
    {
      header: "Type",
      field: "type",
      style: { minWidth: "8rem", width: "12rem" },
    },
    {
      header: "User",
      field: "creatorName",
      style: { minWidth: "8rem", width: "18rem" },
    },
    {
      header: "Vendor",
      field: "vendorName",
      style: { minWidth: "8rem", width: "22rem" },
    },
    {
      header: "Price",
      field: "price",
      customBody: (rowData: BookDetailLineItem) => PriceTemplate(rowData.price),
      style: { minWidth: "6rem", width: "10rem" },
    },
    {
      header: "Transaction Amount",
      field: "quantity",
      style: { minWidth: "6rem", width: "8rem" },
    },
    {
      header: "On Hand",
      field: "stock",
      style: { minWidth: "6rem", width: "8rem" },
    },
  ];

  const onRowClick = (event: DataTableRowClickEvent) => {
    if (!props.disableRowClick ?? true) {
      const lineItem = event.data as BookDetailLineItem;
      logger.debug("Line Item Clicked (Book Detail View)", lineItem);
      const urlExtension = LineItemURLMapper.get(lineItem.type);
      if (urlExtension) {
        navigate(`/${urlExtension}/detail/${lineItem.id}`);
      }
    }
  };

  const columns = createColumns(COLUMNS);
  return (
    <DataTable
      onRowClick={onRowClick}
      rowHover={!props.disableRowClick}
      size="small"
      value={props.lineItems}
    >
      {columns}
    </DataTable>
  );
}
