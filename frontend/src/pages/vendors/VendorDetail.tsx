import { FormEvent, useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { useNavigate, useParams } from "react-router-dom";
import { ModifyVendorReq, VENDORS_API } from "../../apis/vendors/VendorsAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import { showFailure, showSuccess } from "../../components/Toast";
import { PercentEditor } from "../../components/editors/PercentEditor";
import { Button } from "primereact/button";
import ConfirmButton from "../../components/popups/ConfirmPopup";
import BackButton from "../../components/buttons/BackButton";
import DeleteButton from "../../components/buttons/DeleteButton";
import DeletePopup from "../../components/popups/DeletePopup";
import Restricted from "../../permissions/Restricted";
import PercentTemplate from "../../components/templates/PercentTemplate";
import { Vendor } from "./VendorList";
import { APIToInternalVendorConversion } from "../../apis/vendors/VendorsConversions";

const EMPTY_ORIGINAL_DATA: Vendor = {
  id: "",
  name: "",
  buybackRate: undefined,
  numPO: 1,
};

export default function VendorDetail() {
  // From URL
  const { id } = useParams();

  const [isModifiable, setIsModifiable] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>("");
  const [numPOFromVendor, setNumPOFromVendor] = useState<number>(0);
  const [buybackRate, setBuybackRate] = useState<number>();

  const [originalData, setOriginalData] = useState<Vendor>(EMPTY_ORIGINAL_DATA);

  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState<boolean>(false); // Whether the delete popup is shown

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  // Called to make delete pop up show
  const deleteVendorPopup = () => {
    logger.debug("Delete Vendor Clicked");
    setDeletePopupVisible(true);
  };

  // Call to actually delete the element
  const deleteVendorFinal = () => {
    logger.debug("Delete Vendor Finalized");
    setDeletePopupVisible(false);
    VENDORS_API.deleteVendor({ id: id! })
      .then(() => {
        showSuccess(toast, "Vendor Deleted");
        navigate("/vendors");
      })
      .catch(() => {
        showFailure(toast, "Vendor Failed to Delete");
        return;
      });
  };

  // The delete popup
  const deletePopup = (
    <DeletePopup
      deleteItemIdentifier={"this vendor"}
      onConfirm={() => deleteVendorFinal()}
      setIsVisible={setDeletePopupVisible}
    />
  );

  // Load the Vendor data on page load if it is a modify page
  useEffect(() => {
    VENDORS_API.getVendorDetail({ id: id! })
      .then((response) => {
        const vendor = APIToInternalVendorConversion(response);
        setVendorName(response.name);
        setNumPOFromVendor(response.num_purchase_orders);
        setBuybackRate(response.buyback_rate);
        setOriginalData(vendor);
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
      .then((response) => {
        const vendor = APIToInternalVendorConversion(response);
        showSuccess(toast, "Vendor modified");
        setOriginalData(vendor);
      })
      .catch((error) => {
        showFailure(
          toast,
          error.data.errors?.name?.[0]
            ? "Vendor not modified, vendor with this name already exists"
            : "Vendor could not be modified"
        );
        setVendorName(originalData.name);
        setBuybackRate(originalData.buybackRate);
      });
    setIsModifiable(false);
  };

  // The fields
  const buybackRateEditor = PercentEditor(
    buybackRate,
    (newValue) => setBuybackRate(newValue),
    "",
    !isModifiable
  );

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  const deleteButton = (
    <div className="flex col-1">
      <DeleteButton
        onClick={deleteVendorPopup}
        disabled={numPOFromVendor > 0}
        className={"ml-1 "}
      />
    </div>
  );

  return (
    <div>
      <div className="grid flex justify-content-center">
        <Toast ref={toast} />
        <div className="flex col-12 p-0">
          {backButton}
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
          {deleteButton}
        </div>
        <div className="col-7">
          <form onSubmit={onSubmit}>
            <div className="flex mt-3 justify-content-center col-12">
              <div className="flex my-auto pr-2 justify-content-end col-5">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Name:
                </label>
              </div>
              <div className="col-7">
                {!isModifiable ? (
                  <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                    {vendorName}
                  </p>
                ) : (
                  <InputText
                    id="vendor"
                    name="vendor"
                    value={vendorName}
                    disabled={!isModifiable}
                    onChange={(event: FormEvent<HTMLInputElement>): void => {
                      setVendorName(event.currentTarget.value);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex mt-2 mb-3 justify-content-center col-12">
              <div className="flex my-auto pr-2 justify-content-end col-5">
                <label
                  className="text-xl p-component text-teal-900 p-text-secondary"
                  htmlFor="vendor"
                >
                  Buyback Rate:
                </label>
              </div>
              <div className="col-7">
                {!isModifiable ? (
                  <p className="flex p-component p-text-secondary text-900 text-xl text-center mx-0 my-auto">
                    {buybackRate == undefined
                      ? "No Buyback Program"
                      : PercentTemplate(buybackRate)}
                  </p>
                ) : (
                  buybackRateEditor
                )}
              </div>
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
                    setVendorName(originalData.name);
                    setBuybackRate(originalData.buybackRate);
                  }}
                />
              )}
              <Restricted to={"modify"}>
                {!isModifiable && (
                  <Button
                    type="button"
                    label="Edit"
                    icon="pi pi-pencil"
                    onClick={() => setIsModifiable(!isModifiable)}
                  />
                )}
              </Restricted>
              {isModifiable && (
                <ConfirmButton
                  isPopupVisible={isConfirmationPopupVisible}
                  onHide={() => setIsConfirmationPopupVisible(false)}
                  onFinalSubmission={onSubmit}
                  onRejectFinalSubmission={() => {
                    // do nothing
                  }}
                  onShowPopup={() => setIsConfirmationPopupVisible(true)}
                  disabled={!isModifiable || vendorName === ""}
                  buttonLabel={"Submit"}
                  className="p-button-success p-button-raised"
                />
              )}
            </div>
            {/* Maybe be needed in case the confrim button using the popup breaks */}
            {/* <Button disabled={!this.state.isModifiable} label="submit" type="submit" /> */}
          </form>
        </div>
        {deletePopupVisible && deletePopup}
      </div>
    </div>
  );
}
