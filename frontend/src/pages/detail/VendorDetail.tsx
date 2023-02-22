import { FormEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useLocation } from "react-router-dom";
import { ModifyVendorReq, VENDORS_API } from "../../apis/VendorsAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { showFailure, showSuccess } from "../../components/Toast";

export interface VendorDetailState {
  id: number;
  isModifiable: boolean;
}

export default function VendorDetail() {
  const location = useLocation();
  // If we are on this page, we know that the state is not null
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const detailState = location.state! as VendorDetailState;
  const id = detailState.id;
  const [vendorName, setVendorName] = useState<string>("");
  const [isModifiable, setIsModifiable] = useState<boolean>(
    detailState.isModifiable
  );
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Load the Vendor data on page load
  useEffect(() => {
    VENDORS_API.getVendorDetail({ id: id })
      .then((response) => setVendorName(response.name))
      .catch(() => showFailure(toast, "Could not fetch vendor data"));
  }, []);

  const onSubmit = (): void => {
    const modifiedVendor: ModifyVendorReq = { id: id, name: vendorName };
    logger.debug("Edit Vendor Submitted", modifiedVendor);
    VENDORS_API.modifyVendor(modifiedVendor)
      .then(() => showSuccess(toast, "Vendor modified"))
      .catch(() => showFailure(toast, "Vendor could not be modified"));
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
            <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
              Modify Vendor
            </h1>
          </div>
          <form onSubmit={onSubmit}>
            <Toast ref={toast} />
            <div className="flex pb-8 flex-row justify-content-center card-container col-12">
              <ToggleButton
                id="modifyVendorToggle"
                name="modifyVendorToggle"
                onLabel="Editable"
                offLabel="Edit"
                onIcon="pi pi-check"
                offIcon="pi pi-times"
                checked={isModifiable}
                onChange={() => setIsModifiable(!isModifiable)}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <div className="pt-2 pr-2">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Vendor
                </label>
              </div>
              <InputText
                id="vendor"
                className="p-inputtext"
                name="vendor"
                value={vendorName}
                disabled={!isModifiable}
                onChange={(event: FormEvent<HTMLInputElement>): void => {
                  setVendorName(event.currentTarget.value);
                }}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <ConfirmPopup
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
