import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import { VENDORS_API } from "../../apis/vendors/VendorsAPI";

export interface VendorDropdownProps {
  setVendorMap: (arg0: Map<string, number>) => void; // Setter for vendor map
  setSelectedVendor: (arg0: string) => void; // Set the selected vendor
  selectedVendor: string; // The selected vendor
  isModifiable?: boolean; // If the dropdown can be changed
  hasBuybackPolicy?: boolean; // If the vendor has a buyback policy
}

// This cannot be used in a table cell in the current form, only when there is one on the page
export default function VendorDropdown(props: VendorDropdownProps) {
  const [vendorNamesList, setVendorNamesList] = useState<string[]>([]);

  useEffect(() => {
    VENDORS_API.getVendorsNoPagination(props.hasBuybackPolicy).then(
      (response) => {
        const tempVendorMap = new Map<string, number>();
        for (const vendor of response) {
          tempVendorMap.set(vendor.name, vendor.id);
        }
        props.setVendorMap(tempVendorMap);
        setVendorNamesList(response.map((vendor) => vendor.name));
      }
    );
  }, []);

  return (
    <Dropdown
      value={props.selectedVendor}
      options={vendorNamesList}
      placeholder="Select a Vendor"
      filter
      disabled={!props.isModifiable ?? false}
      onChange={(e) => props.setSelectedVendor(e.value)}
      virtualScrollerOptions={{ itemSize: 35 }}
    />
  );
}
