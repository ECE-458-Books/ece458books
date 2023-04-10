import { SalesRecord } from "../../pages/sales/SRList";
import { v4 as uuid } from "uuid";
import { externalToInternalDate } from "../../util/DateOps";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";
import { APISR, APISRSaleRow, APISaleCSVImportRow } from "./SalesAPI";

// Sales Records
// Internal data type -> ordering required for book get API

export const APISRSortFieldMap = new Map<string, string>([
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
  ["isSalesRecord", "is_sales_record"],
  ["creatorName", "username"],
]);

function APIToInternalSRSaleConversion(sale: APISRSaleRow): LineItem {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: sale.id!.toString(),
    bookId: sale.book,
    bookISBN: sale.book_isbn,
    bookTitle: formatBookForDropdown(sale.book_title, sale.book_isbn),
    quantity: sale.quantity,
    price: sale.unit_retail_price,
  };
}

export function APIToInternalSRConversion(sr: APISR): SalesRecord {
  const sales: LineItem[] = sr.sales.map((sale) =>
    APIToInternalSRSaleConversion(sale)
  );

  return {
    id: sr.id.toString(),
    date: externalToInternalDate(sr.date),
    totalBooks: sr.num_books,
    uniqueBooks: sr.num_unique_books,
    totalRevenue: sr.total_revenue,
    sales: sales,
    isDeletable: sr.is_deletable,
    isSalesRecord: sr.is_sales_record,
    creatorName: sr.username,
  };
}

export function APIToInternalSalesCSVConversion(
  sales: APISaleCSVImportRow[]
): LineItem[] {
  return sales.map((sale) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0,
      bookId: sale.book,
      bookTitle: formatBookForDropdown(sale.book_title, sale.isbn_13),
      bookISBN: sale.isbn_13,
      quantity: sale.quantity,
      price: sale.unit_retail_price,
      errors: sale.errors,
    } as LineItem;
  });
}
