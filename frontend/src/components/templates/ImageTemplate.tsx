import { Image } from "primereact/image";
import { DEFAULT_BOOK_IMAGE } from "../uploaders/ImageFileUploader";
import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from "../editors/PriceEditor";

export function imageBodyTemplate(thumbnailURL: string) {
  if (!thumbnailURL) {
    thumbnailURL = DEFAULT_BOOK_IMAGE;
  }
  return (
    <Image
      // Leaving this line in case of future image browser side caching workaround is needed
      src={`${thumbnailURL}${
        thumbnailURL.startsWith("https://books") ? "?" + Date.now() : ""
      }`}
      // src={thumbnailURL}
      id="imageONpage"
      alt="Image"
      imageStyle={{
        objectFit: "contain",
        maxHeight: MAX_IMAGE_HEIGHT,
        maxWidth: MAX_IMAGE_WIDTH,
      }}
      className="flex justify-content-center"
      imageClassName="shadow-2 border-round"
    />
  );
}

export default function ImageTemplateWithButtons(
  deleteButton: JSX.Element,
  uploadButton: JSX.Element,
  thumbnailURL: string
) {
  if (!thumbnailURL || thumbnailURL.includes("https://127.0.0.1")) {
    thumbnailURL = DEFAULT_BOOK_IMAGE;
  }
  return (
    <>
      <div className="flex justify-content-center">
        <Image
          // Leaving this line in case of future image browser side caching workaround is needed
          src={`${thumbnailURL}
            ${
              thumbnailURL.startsWith("https://books") ? "?" + Date.now() : ""
            }`}
          // src={thumbnailURL}
          id="imageONpage"
          alt="Image"
          imageStyle={{
            objectFit: "contain",
            maxHeight: MAX_IMAGE_HEIGHT,
            maxWidth: MAX_IMAGE_WIDTH,
          }}
        />
      </div>
      <div className="flex justify-content-between">
        {uploadButton}
        {deleteButton}
      </div>
    </>
  );
}
