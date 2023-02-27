import { FormEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmPopup from "../../components/popups/ConfirmPopup";
import { useNavigate, useParams } from "react-router-dom";
import {
  AddVendorReq,
  ModifyVendorReq,
  VENDORS_API,
} from "../../apis/VendorsAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { showFailure, showSuccess } from "../../components/Toast";
import { percentEditor } from "../../util/TableCellEditFuncs";
import { Button } from "primereact/button";
import ConfirmButton from "../../components/popups/ConfirmPopup";

export default function VendorDetail() {
  // From URL
  const { id } = useParams();

  const [isModifiable, setIsModifiable] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>("");
  const [buybackRate, setBuybackRate] = useState<number>();

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Load the Vendor data on page load if it is a modify page
  useEffect(() => {
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

    callModifyVendorAPI();
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

  // The navigator to switch pages
  const navigate = useNavigate();

  return (
    <div>
      <div className="grid flex justify-content-center">
        <Toast ref={toast} />
        <div className="flex col-12 p-0">
          <div className="flex col-1">
            <Button
              type="button"
              label="Back"
              icon="pi pi-arrow-left"
              onClick={() => navigate("/vendors")}
              className="p-button-sm my-auto ml-1"
            />
          </div>
          <div className="pt-2 col-10">
            {isModifiable ? (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Modify Vendor
              </h1>
            ) : (
              <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
                Vendor Details
              </h1>
            )}
          </div>
          <div className="flex col-1">
            <Button
              type="button"
              label="Delete"
              icon="pi pi-trash"
              disabled
              //onClick={() => ()}
              className="p-button-sm my-auto ml-1 p-button-danger"
            />
          </div>
        </div>
        <div className="col-7">
          <form onSubmit={onSubmit}>
            <div className="flex mt-3 justify-content-center col-12">
              <div className="flex my-auto pr-2 justify-content-end col-5">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Name
                </label>
              </div>
              <div className="col-7">
                <InputText
                  id="vendor"
                  name="vendor"
                  value={vendorName}
                  disabled={!isModifiable}
                  onChange={(event: FormEvent<HTMLInputElement>): void => {
                    setVendorName(event.currentTarget.value);
                  }}
                />
              </div>
            </div>

            <div className="flex mt-2 mb-3 justify-content-center col-12">
              <div className="flex my-auto pr-2 justify-content-end col-5">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Buyback Rate
                </label>
              </div>
              <div className="col-7">{buybackRateEditor}</div>
            </div>

            <div className="grid justify-content-evenly col-12">
              {isModifiable && (
                <Button
                  type="button"
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-warning"
                  onClick={() => {
                    setIsModifiable(!isModifiable);
                    window.location.reload();
                  }}
                />
              )}
              {!isModifiable && (
                <Button
                  type="button"
                  label="Edit"
                  icon="pi pi-pencil"
                  onClick={() => setIsModifiable(!isModifiable)}
                />
              )}
              {isModifiable && (
                <ConfirmButton
                  isVisible={isConfirmationPopupVisible}
                  hideFunc={() => setIsConfirmationPopupVisible(false)}
                  acceptFunc={onSubmit}
                  rejectFunc={() => {
                    // do nothing
                  }}
                  buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
                  disabled={!isModifiable}
                  label={"Submit"}
                  className="p-button-success p-button-raised"
                />
              )}
            </div>
            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
