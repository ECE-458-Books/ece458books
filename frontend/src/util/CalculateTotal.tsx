interface LineItem {
  price: number;
  quantity: number;
}

export function calculateTotal(items: LineItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
