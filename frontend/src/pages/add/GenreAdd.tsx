import React, { FormEvent, useState } from "react";
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
    <div className="grid flex justify-content-center">
      <link
        rel="stylesheet"
        href="https://unpkg.com/primeflex@3.1.2/primeflex.css"
      ></link>
      <div className="col-5">
        <div className="py-5">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Add Genre Page
          </h1>
        </div>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <label
              className="text-xl p-component text-teal-800 p-text-secondary"
              htmlFor="addgenre"
            >
              Add Genre
            </label>
          </div>
          <InputTextarea
            id="addgenre"
            name="addgenre"
            value={textBox}
            onChange={(e: FormEvent<HTMLTextAreaElement>) =>
              setTextBox(e.currentTarget.value)
            }
            rows={8}
            cols={40}
            className="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
          />
          <div className="flex flex-row justify-content-between card-container col-12">
            <Button
              label="Clear"
              type="button"
              onClick={() => setTextBox("")}
              className="p-button-info"
            />
            <Button
              label="SUBMIT"
              type="submit"
              icon="pi pi-check"
              className="p-button-success p-button-raised"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
