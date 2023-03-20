import { v4 as uuid } from "uuid";
import { externalToInternalDate } from "../../util/DateOps";
import { BuyBack } from "../../pages/buybacks/BuyBackList";
import { APIBB, APIBBCSVImportRow, APIBBSaleRow } from "./BuyBackAPI";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";

// Buy Backs
// Internal data type -> ordering required for book get API

export const APIBBSortFieldMap = new Map<string, string>([
  ["vendorName", "vendor_name"],
  ["vendorId", "vendor"],
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalRevenue", "total_revenue"],
  ["date", "date"],
  ["associatedUserName", "user"],
  ["associatedUserId", "user"],
]);
function APIToInternalBBSaleConversion(sale: APIBBSaleRow): LineItem {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: sale.id!.toString(),
    bookId: sale.book,
    bookISBN: sale.book_isbn,
    bookTitle: formatBookForDropdown(sale.book_title, sale.book_isbn),
    quantity: sale.quantity,
    price: sale.unit_buyback_price,
  };
}

export function APIToInternalBBConversion(bb: APIBB): BuyBack {
  const sales: LineItem[] = bb.buybacks.map((sale) =>
    APIToInternalBBSaleConversion(sale)
  );

  return {
    id: bb.id.toString(),
    date: externalToInternalDate(bb.date),
    totalBooks: bb.num_books,
    uniqueBooks: bb.num_unique_books,
    totalRevenue: bb.total_revenue,
    vendorID: bb.vendor,
    vendorName: bb.vendor_name,
    sales: sales,
    isDeletable: bb.is_deletable,
    associatedUserId: bb.user,
    associatedUserName: bb.username,
  };
}

export function APIToInternalBuybackCSVConversion(
  buybacks: APIBBCSVImportRow[]
): LineItem[] {
  return buybacks.map((buyback) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0,
      bookId: buyback.book,
      bookTitle: formatBookForDropdown(buyback.book_title, buyback.isbn_13),
      bookISBN: buyback.isbn_13,
      quantity: buyback.quantity,
      price: buyback.unit_buyback_price,
      errors: buyback.errors,
    } as LineItem;
  });
}
