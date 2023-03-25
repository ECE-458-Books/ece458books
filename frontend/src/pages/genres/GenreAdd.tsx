import { FormEvent, useRef, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { GENRES_API } from "../../apis/genres/GenresAPI";
import { logger } from "../../util/Logger";
import { Toast } from "primereact/toast";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showFailure, showSuccess } from "../../components/Toast";

export default function GenreAdd() {
  const [textBox, setTextBox] = useState<string>("");

  const resetPageInputFields = () => {
    setTextBox("");
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const onSubmit = (goBack: boolean): void => {
    logger.debug("Add Genre Submitted", textBox);
    //take string input assigned to variable textBox and parse it based on newline character
    //into a string array using a regular expression
    let str: string[] = textBox.split(/\r?\n/);
    //take the string array -> check for and remove any elements containing only whitespace
    //or nothing at all
    str = str.filter((str) => /\S/.test(str));
    //loop through all elements and do an API submission to add the strings to database
    const genreRequests = str.map((genre: string) => {
      return GENRES_API.addGenre({
        name: genre,
      });
    });

    axios
      .all(genreRequests)
      .then(() => {
        showSuccess(toast, "Genres added successfully");
        goBack ? navigate("/genres") : resetPageInputFields();
      })
      .catch((error) => {
        showFailure(
          toast,
          error.data.errors?.name?.[0]
            ? "One or more of the genres already exists"
            : "One or more of the genres failed to add"
        );
      });
  };

  // The navigator to switch pages
  const navigate = useNavigate();

  const backButton = (
    <div className="flex col-1">
      <BackButton className="ml-1" />
    </div>
  );

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="flex col-12 p-0">
        {backButton}
        <div className="pt-2 col-10">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Add Genre
          </h1>
        </div>
      </div>
      <div className="col-7">
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
          placeholder="Enter genres, separated by newline breaks (genre name has 30 character limit)"
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
            label="Submit"
            type="button"
            onClick={() => onSubmit(false)}
            disabled={textBox.length == 0}
            className="p-button-success p-button-raised"
          />
          <Button
            label="Submit and Go Back"
            type="button"
            disabled={textBox.length == 0}
            onClick={() => {
              onSubmit(true);
            }}
            className="p-button-success p-button-raised"
          />
        </div>
      </div>
    </div>
  );
}
