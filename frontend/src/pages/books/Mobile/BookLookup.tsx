import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { BOOKS_API, GetBooksResp } from "../../../apis/books/BooksAPI";
import { showFailure, showSuccess } from "../../../components/Toast";
import { APIToInternalBookConversion } from "../../../apis/books/BooksConversions";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { Result } from "@zxing/library";

export default function BookLookup() {
  const [textBox, setTextBox] = useState<string>("");
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setTextBox("");
  }, []);

  const searchButtonClick = () => {
    BOOKS_API.getBooks({ isbn_only: true, search: textBox })
      .then((response) => onAPIResponse(response))
      .catch(() => showFailure(toast, "Book Search Failed"));
  };

  const onAPIResponse = (response: GetBooksResp) => {
    showSuccess(toast, "Message Recieved");
    if (response.results.length > 0) {
      const book = APIToInternalBookConversion(response.results[0]);
      navigate(`${"/books/detail/"}${book.id}`);
    } else {
      showFailure(toast, "Could Not Find Book with ISBN: " + textBox);
    }
  };

  const onUpdateScreen = (err: unknown, result: Result | undefined) => {
    if (result) {
      setTextBox(result.getText());
      setIsVideoPaused(false);
      setIsVideoVisible(false);
    } else {
      setTextBox(textBox);
    }
  };

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} position="top-center" />
      <div className="col-12 py-2">
        <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
          Book Lookup
        </h1>
      </div>
      <div className="flex justify-content-center col-12 py-5">
        <InputText
          value={textBox}
          keyfilter="int"
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setTextBox(e.currentTarget.value)
          }
        />
      </div>
      <div className="flex justify-content-center col-12">
        <Button
          icon="pi pi-search"
          iconPos="right"
          label="Search"
          onClick={() => searchButtonClick()}
        />
      </div>

      {isVideoVisible && (
        <BarcodeScannerComponent
          width={350}
          height={350}
          facingMode="environment"
          onUpdate={(err: unknown, result: Result | undefined) =>
            onUpdateScreen(err, result)
          }
          stopStream={isVideoPaused}
        />
      )}

      <div
        className={
          isVideoVisible
            ? "flex justify-content-center col-12"
            : "flex justify-content-center col-12 pt-6"
        }
      >
        <Button
          icon="pi pi-camera"
          label={isVideoVisible ? "Turn Off Camera" : "Scan Barcode"}
          className="p-button-lg p-button-info"
          onClick={() => {
            setIsVideoPaused(!isVideoPaused);
            setIsVideoVisible(!isVideoVisible);
          }}
        />
      </div>
    </div>
  );
}
