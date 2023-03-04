import { Vendor } from "../../pages/vendors/VendorList";
import { APIVendor } from "./VendorsAPI";

// Vendor

export const APIVendorSortFieldMap = new Map<string, string>([
  ["name", "name"],
  ["buybackRate", "null_considered_buyback_rate"],
]);

export function APIToInternalVendorConversion(vendor: APIVendor): Vendor {
  return {
    id: vendor.id.toString(),
    name: vendor.name,
    numPO: vendor.num_purchase_orders,
    buybackRate: vendor.buyback_rate,
  };
}
