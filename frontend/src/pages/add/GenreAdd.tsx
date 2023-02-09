import React, { FormEvent, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { GENRES_API } from "../../apis/GenresAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";

export default function GenreAdd() {
  const [textBox, setTextBox] = useState("");

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Genre added" });
  };

  const showFailure = () => {
    toast.current?.show({
      severity: "error",
      summary: "Genre could not be added",
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    logger.debug("Add Genre Submitted", textBox);
    //take string input assigned to variable textBox and parse it based on newline character
    //into a string array using a regular expression
    let str: string[] = textBox.split(/\r?\n/);
    //take the string array -> check for and remove any elements containing only whitespace
    //or nothing at all
    str = str.filter((str) => /\S/.test(str));
    //loop through all elements and do an API submission to add the strings to database
    for (let i = 0; i < str.length; i++) {
      GENRES_API.addGenres(str[i]).then((response) => {
        if (response.status == 201) {
          showSuccess();
        } else {
          showFailure();
        }
      });
    }
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
          <Toast ref={toast} />
          <div className="py-2">
            <label
              className="text-xl p-component text-teal-900 p-text-secondary"
              htmlFor="addgenre"
            >
              Add Genre
            </label>
          </div>
          <InputTextarea
            id="addgenre"
            name="addgenre"
            placeholder="Enter Multiple Genres using Newline breaks"
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
