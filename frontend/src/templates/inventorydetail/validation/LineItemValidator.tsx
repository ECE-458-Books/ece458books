import { LineItem } from "../LineItemTableTemplate";

export default function areLineItemsValid(lineItems: LineItem[]) {
  for (const sale of lineItems) {
    if (!sale.bookTitle || !(sale.price >= 0) || !sale.quantity) {
      return false;
    }
  }
  return true;
}
