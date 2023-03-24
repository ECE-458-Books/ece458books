import { SalesRecord } from "../../pages/sales/SRList";
import { externalToInternalDate } from "../../util/DateOps";
import * as SalesAPI from "./SalesAPI";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";

// Sales Records
// Internal data type -> ordering required for book get API

export const APISRSortFieldMap = new Map<string, string>([
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
]);
function APIToInternalSRSaleConversion(sale: SalesAPI.APISRSaleRow): LineItem {
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

export function APIToInternalSRConversion(sr: SalesAPI.APISR): SalesRecord {
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
  };
}
