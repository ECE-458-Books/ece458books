import React, { FormEvent, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { VENDORS_API } from "../../apis/VendorsAPI";
import { logger } from "../../util/Logger";

export default function VendorAdd() {
  const [textBox, setTextBox] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Add Vendor Submitted", textBox);
    VENDORS_API.addVendor(textBox);
    event.preventDefault();
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="addvendor">Add Vendors</label>
        <InputTextarea
          id="addvendor"
          name="addvendor"
          value={textBox}
          onChange={(e: FormEvent<HTMLTextAreaElement>) =>
            setTextBox(e.currentTarget.value)
          }
          rows={5}
          cols={30}
        />
        <Button label="Clear" type="button" onClick={() => setTextBox("")} />
        <Button label="submit" type="submit" />
      </form>
    </div>
  );
}
