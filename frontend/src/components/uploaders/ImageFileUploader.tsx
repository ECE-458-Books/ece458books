import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";
import { Style } from "../../css/Style";

export const DEFAULT_BOOK_IMAGE =
  "https://books-test.colab.duke.edu/media/books/default.jpeg";

interface ImageUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  disabled?: boolean;
  className?: string;
  style?: Style;
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
      chooseOptions={{
        icon: "pi pi-upload",
        className: props.className,
        style: props.style,
      }}
    />
  );
}
