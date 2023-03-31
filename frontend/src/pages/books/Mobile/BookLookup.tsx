import { FormEvent, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import {
  AddBooksInitialLookupResp,
  BOOKS_API,
} from "../../../apis/books/BooksAPI";
import { showFailure, showSuccess } from "../../../components/Toast";
import { APIToInternalBookConversionWithDB } from "../../../apis/books/BooksConversions";
//import BarcodeScannerComponent from "react-qr-barcode-scanner";
//import { Result } from "@zxing/library";

export default function BookLookup() {
  const [textBox, setTextBox] = useState<string>("");
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const navigate = useNavigate();

  const searchButtonClick = () => {
    BOOKS_API.addBookInitialLookup({ isbns: textBox })
      .then((resposne) => onAPIResponse(resposne))
      .catch(() => showFailure(toast, "Book Search Failed"));
  };

  const onAPIResponse = (response: AddBooksInitialLookupResp) => {
    showSuccess(toast, "Message Recieved");
    if (response.books.length > 0) {
      const book = APIToInternalBookConversionWithDB(response.books[0]);
      navigate(`${"/books/detail/"}${book.id}`);
    } else {
      showFailure(toast, "Could Not Find Book with ISBN: " + textBox);
    }
  };

  // const onUpdateScreen = (err: unknown, result: Result | undefined) => {
  //   if (result) {
  //     setTextBox(result.text);
  //     setIsVideoVisible(false);
  //   } else {
  //     setTextBox("");
  //   }
  // };

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} position="top-center" />
      <div className="col-12 py-5">
        <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
          Book Lookup
        </h1>
      </div>
      <div className="flex justify-content-center col-12 py-5">
        <InputText
          value={textBox}
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

      {/* {isVideoVisible && (
        <BarcodeScannerComponent
          width={400}
          height={400}
          onUpdate={(err: unknown, result: Result | undefined) =>
            onUpdateScreen(err, result)
          }
        />
      )} */}

      <div className="flex justify-content-center col-12 pt-5">
        <Button
          icon="pi pi-camera"
          label="Scan Barcode"
          className="p-button-lg p-button-info"
          onClick={() => searchButtonClick()}
        />
      </div>
    </div>
  );
}
