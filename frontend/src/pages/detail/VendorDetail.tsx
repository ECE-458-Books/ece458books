import { FormEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useParams } from "react-router-dom";
import {
  AddVendorReq,
  ModifyVendorReq,
  VENDORS_API,
} from "../../apis/VendorsAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { showFailure, showSuccess } from "../../components/Toast";
import { percentEditor } from "../../util/TableCellEditFuncs";

export default function VendorDetail() {
  // From URL
  const { id } = useParams();
  const isVendorAddPage = id === undefined;

  const [isModifiable, setIsModifiable] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>("");
  const [buybackRate, setBuybackRate] = useState<number>();

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Load the Vendor data on page load if it is a modify page
  useEffect(() => {
    if (isVendorAddPage) return;
    VENDORS_API.getVendorDetail({ id: id! })
      .then((response) => {
        setVendorName(response.name);
        setBuybackRate(response.buyback_rate);
      })
      .catch(() => showFailure(toast, "Could not fetch vendor data"));
  }, []);

  // When the user submits
  const onSubmit = (): void => {
    const modifiedVendor: ModifyVendorReq = { id: id!, name: vendorName };
    logger.debug("Edit Vendor Submitted", modifiedVendor);

    if (isVendorAddPage) {
      callAddVendorAPI();
    } else {
      callModifyVendorAPI();
    }
  };

  // For add page
  const callAddVendorAPI = (): void => {
    const newVendor: AddVendorReq = {
      name: vendorName,
      buyback_rate: buybackRate,
    };

    VENDORS_API.addVendor(newVendor)
      .then(() => showSuccess(toast, "Vendor added"))
      .catch(() => showFailure(toast, "Vendor could not be added"));
    setIsModifiable(false);
  };

  // For modify page
  const callModifyVendorAPI = (): void => {
    const modifiedVendor: ModifyVendorReq = {
      name: vendorName,
      id: id!,
      buyback_rate: buybackRate,
    };

    VENDORS_API.modifyVendor(modifiedVendor)
      .then(() => showSuccess(toast, "Vendor modified"))
      .catch(() => showFailure(toast, "Vendor could not be modified"));
    setIsModifiable(false);
  };

  // The fields
  const buybackRateEditor = percentEditor(
    buybackRate,
    (newValue) => setBuybackRate(newValue),
    !isModifiable
  );

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
              {isVendorAddPage ? "Add Vendor" : "Modify Vendor"}
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
                  Name
                </label>
              </div>
              <InputText
                id="vendor"
                className="w-4"
                name="vendor"
                value={vendorName}
                disabled={!isModifiable}
                onChange={(event: FormEvent<HTMLInputElement>): void => {
                  setVendorName(event.currentTarget.value);
                }}
              />
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <div className="pt-2 pr-2">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Buyback Rate
                </label>
              </div>
              {buybackRateEditor}
            </div>

            <div className="flex flex-row justify-content-center card-container col-12">
              <ConfirmPopup
                isPopupVisible={isConfirmationPopupVisible}
                hideFunc={() => setIsConfirmationPopupVisible(false)}
                onFinalSubmission={onSubmit}
                onRejectFinalSubmission={() => {
                  console.log("reject");
                }}
                onShowPopup={() => {
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
