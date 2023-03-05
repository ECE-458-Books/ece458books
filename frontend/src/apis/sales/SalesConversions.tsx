import { v4 as uuid } from "uuid";
import { SRSaleRow } from "../../pages/sales/SRDetail";
import { SalesReconciliation } from "../../pages/sales/SRList";
import { externalToInternalDate } from "../../util/DateOps";
import { APISaleCSVImportRow, APISR, APISRSaleRow } from "./SalesAPI";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";

// Sales Reconciliations
// Internal data type -> ordering required for book get API

export const APISRSortFieldMap = new Map<string, string>([
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
]);
function APIToInternalSRSaleConversion(sale: APISRSaleRow): SRSaleRow {
  return {
    isNewRow: false,
    id: sale.id!.toString(),
    bookId: sale.book,
    bookISBN: sale.book_isbn,
    bookTitle: formatBookForDropdown(sale.book_title, sale.book_isbn),
    quantity: sale.quantity,
    price: sale.unit_retail_price,
  };
}

export function APIToInternalSRConversion(sr: APISR): SalesReconciliation {
  const sales: SRSaleRow[] = sr.sales.map((sale) =>
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
  };
}

export function APIToInternalSalesCSVConversion(
  sales: APISaleCSVImportRow[]
): SRSaleRow[] {
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
    } as SRSaleRow;
  });
}
