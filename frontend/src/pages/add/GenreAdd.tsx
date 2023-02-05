import React, { FormEvent, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

export default function GenreAdd() {
  const [textBox, setTextBox] = useState("");

  const onSubmit = (): void => {
    console.log(textBox);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label htmlFor="addgenre">Add Genres</label>
        <InputTextarea
          id="addgenre"
          name="addgenre"
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
