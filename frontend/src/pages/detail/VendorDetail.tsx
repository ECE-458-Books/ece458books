import React, { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";
import { useLocation } from "react-router-dom";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { Vendor } from "../list/VendorList";
import { InputNumber } from "primereact/inputnumber";
import { logger } from "../../util/Logger";

export interface VendorDetailState {
  id: number;
  vendor: string;
  isModifiable: boolean;
  isConfirmationPopupVisible: boolean;
}

export default function VendorDetail() {
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as VendorDetailState;
  const [vendor, setVendor] = useState<string>(detailState.vendor);
  const [id, setId] = useState<number>(detailState.id);
  const [isModifiable, setIsModifiable] = useState(detailState.isModifiable);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] = useState(
    detailState.isConfirmationPopupVisible
  );

  const onSubmit = (): void => {
    const modifiedVendor: Vendor = { id: id, name: vendor };
    logger.debug("Edit Vendor Submitted", modifiedVendor);
    VENDORS_API.modifyVendor(modifiedVendor);
    setIsModifiable(false);
  };

  return (
    <div>
      <h1>Modify Vendor</h1>
      <form onSubmit={onSubmit}>
        <ToggleButton
          id="modifyVendorToggle"
          name="modifyVendorToggle"
          onLabel="Modifiable"
          offLabel="Modify"
          onIcon="pi pi-check"
          offIcon="pi pi-times"
          checked={isModifiable}
          onChange={() => setIsModifiable(!isModifiable)}
        />

        <label htmlFor="vendor">Vendor</label>
        <InputText
          id="vendor"
          className="p-inputtext-sm"
          name="vendor"
          value={vendor}
          disabled={!isModifiable}
          onChange={(event: FormEvent<HTMLInputElement>): void => {
            setVendor(event.currentTarget.value);
          }}
        />

        <ConfirmButton
          isVisible={isConfirmationPopupVisible}
          hideFunc={() => setIsConfirmationPopupVisible(false)}
          acceptFunc={onSubmit}
          rejectFunc={() => {
            console.log("reject");
          }}
          buttonClickFunc={() => {
            setIsConfirmationPopupVisible(true);
          }}
          disabled={!isModifiable}
          label={"Submit"}
        />
        {/* Maybe be needed in case the confrim button using the popup breaks */}
        {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
      </form>
    </div>
  );
}
