import React, { FormEvent, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { GENRES_API } from "../../apis/GenresAPI";
import { logger } from "../../util/Logger";

export default function GenreAdd() {
  const [textBox, setTextBox] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Add Genre Submitted", textBox);
    GENRES_API.addGenres(textBox);
    event.preventDefault();
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
        <Button label="Clear" type="button" onClick={() => setTextBox("")} />
        <Button label="submit" type="submit" />
      </form>
    </div>
  );
}
