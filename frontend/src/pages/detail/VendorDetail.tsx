import React, { FormEvent, useState } from "react";
import { InputText } from "primereact/inputtext";
import { ToggleButton } from "primereact/togglebutton";
import ConfirmButton from "../../components/ConfirmButton";

export default function VendorDetail() {
  const [vendor, setVendor] = useState<string>("");
  const [isModifiable, setIsModifiable] = useState(false);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState(false);

  const onSubmit = (): void => {
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
          name="genre"
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
