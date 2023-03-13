import { v4 as uuid } from "uuid";
import { PurchaseOrder } from "../../pages/purchases/POList";
import { externalToInternalDate } from "../../util/DateOps";
import {
  APIPO,
  APIPOPurchaseRow,
  APIPurchaseCSVImportRow,
} from "./PurchasesAPI";
import { formatBookForDropdown } from "../../components/dropdowns/BookDropdown";
import { LineItem } from "../../templates/inventorydetail/LineItemTableTemplate";

// Purchase Orders
// Internal data type -> ordering required for PO get API

export const APIPOSortFieldMap = new Map<string, string>([
  ["vendorName", "vendor_name"],
  ["vendorId", "vendor"],
  ["uniqueBooks", "num_unique_books"],
  ["totalBooks", "num_books"],
  ["totalCost", "total_cost"],
  ["date", "date"],
]);

export function APIToInternalPOPurchaseConversion(
  purchase: APIPOPurchaseRow
): LineItem {
  return {
    isNewRow: false,
    // (id is always defined from API)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    id: purchase.id!.toString(),
    bookId: purchase.book,
    bookTitle: formatBookForDropdown(purchase.book_title, purchase.book_isbn),
    bookISBN: purchase.book_isbn,
    quantity: purchase.quantity,
    price: purchase.unit_wholesale_price,
  };
}

export function APIToInternalPOConversion(po: APIPO): PurchaseOrder {
  const purchases: LineItem[] = po.purchases.map((purchase) =>
    APIToInternalPOPurchaseConversion(purchase)
  );

  return {
    id: po.id.toString(),
    date: externalToInternalDate(po.date),
    vendorName: po.vendor_name,
    vendorId: po.vendor_id,
    totalBooks: po.num_books,
    uniqueBooks: po.num_unique_books,
    totalCost: po.total_cost,
    purchases: purchases,
    isDeletable: po.is_deletable,
  };
}

export function APIToInternalPurchasesCSVConversion(
  purchases: APIPurchaseCSVImportRow[]
): LineItem[] {
  return purchases.map((purchase) => {
    return {
      isNewRow: true,
      id: uuid(),
      subtotal: 0,
      bookId: purchase.book,
      bookTitle: formatBookForDropdown(purchase.book_title, purchase.isbn_13),
      bookISBN: purchase.isbn_13,
      quantity: purchase.quantity,
      price: purchase.unit_wholesale_price,
      errors: purchase.errors,
    } as LineItem;
  });
}
