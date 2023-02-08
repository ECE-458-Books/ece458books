import React, { FormEvent, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";
import { useLocation } from "react-router-dom";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { Vendor } from "../list/VendorList";
import { InputNumber } from "primereact/inputnumber";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";

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

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Vendor modified" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Vendor could not be modified",
    });
  };

  const onSubmit = (): void => {
    const modifiedVendor: Vendor = { id: id, name: vendor };
    logger.debug("Edit Vendor Submitted", modifiedVendor);
    VENDORS_API.modifyVendor(modifiedVendor).then((response) => {
      if (response.status == 200) {
        showSuccess();
      } else {
        showFailure();
      }
    });
    setIsModifiable(false);
  };

  return (
    <div>
      <div className="grid flex justify-content-center">
        <link
          rel="stylesheet"
          href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
        ></link>
        <div className="col-5">
          <div className="py-5">
            <h1 className="text-center text-900 color: var(--surface-800);">
              Modify Vendor
            </h1>
          </div>
          <form onSubmit={onSubmit}>
            <Toast ref={toast} />
            <div className="flex pb-8 flex-row justify-content-center card-container col-12">
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
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <div className="pt-2 pr-2">
                <label className="text-xl" htmlFor="vendor">
                  Genre
                </label>
              </div>
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
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
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
                className="p-button-success p-button-raised"
              />
            </div>
            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
