import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";

export const DEFAULT_BOOK_IMAGE =
  "http://books-db.colab.duke.edu/media/books/default.jpg";

interface ImageUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  disabled?: boolean;
}

export default function ImageUploader(props: ImageUploaderProps) {
  return (
    <FileUpload
      auto
      disabled={props.disabled}
      mode="basic"
      accept="image/gif, image/jpeg, image/png, image/webp"
      customUpload
      uploadHandler={props.uploadHandler}
      chooseLabel={"Upload image"}
    />
  );
}
