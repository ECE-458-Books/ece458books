export default function PriceTemplate(value: number | bigint | undefined) {
  if (value == null) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
