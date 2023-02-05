import React, { FormEvent, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

export default function VendorAdd() {
  const [textBox, setTextBox] = useState("");

  const onSubmit = (): void => {
    console.log(textBox);
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
        <Button label="submit" type="submit" />
      </form>
    </div>
  );
}
