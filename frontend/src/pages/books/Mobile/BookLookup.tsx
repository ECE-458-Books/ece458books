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
import { TextResult } from "dynamsoft-javascript-barcode";
import { BarcodeScanner } from "react-barcode-qrcode-scanner";

export default function BookLookup() {
  const [textBox, setTextBox] = useState<string>("");
  const [isVideoVisible, setIsVideoVisible] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isVideoPaused, setIsVideoPaused] = useState<boolean>(false);
  const [runtimeSettings, setRuntimeSettings] = useState<string>(
    '{"ImageParameter":{"BarcodeFormatIds":["BF_QR_CODE"],"Description":"","Name":"Settings"},"Version":"3.0"}'
  ); //use JSON template to decode QR codes only

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

  // Camera Stuff

  const onOpened = (cam: HTMLVideoElement, camLabel: string) => {
    // You can access the video element in the onOpened event
    console.log("opened");
  };

  const onClosed = () => {
    console.log("closed");
  };

  const onDeviceListLoaded = (devices: MediaDeviceInfo[]) => {
    console.log(devices);
  };

  const onScanned = (results: TextResult[]) => {
    // barcode results
    setTextBox(results[0].barcodeText);
  };

  const onClicked = (result: TextResult) => {
    // when a barcode overlay is clicked
    alert(result.barcodeText);
  };

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

      {isVideoVisible && (
        <BarcodeScanner
          isActive={isCameraActive}
          isPause={isVideoPaused}
          license="license key for Dynamsoft Barcode Reader"
          drawOverlay={true}
          desiredCamera="back"
          facingMode="environment"
          desiredResolution={{ width: 300, height: 300 }}
          runtimeSettings={runtimeSettings}
          onScanned={onScanned}
          onClicked={onClicked}
          onOpened={onOpened}
          onClosed={onClosed}
          onDeviceListLoaded={onDeviceListLoaded}
        />
      )}

      <div className="flex justify-content-center col-12 pt-5">
        <Button
          icon="pi pi-camera"
          label="Scan Barcode"
          className="p-button-lg p-button-info"
          onClick={() => setIsVideoVisible(!isVideoVisible)}
        />
      </div>
    </div>
  );
}
