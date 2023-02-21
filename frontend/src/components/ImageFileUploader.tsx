import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";

const MAX_FILE_UPLOAD = 5000000; // Bytes

interface ImageUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  disabled: boolean;
}

export default function ImageUploader(props: ImageUploaderProps) {
  return (
    <div className="card flex justify-content-center">
      <FileUpload
        mode="basic"
        name="imageUpload"
        auto
        disabled={props.disabled}
        accept="image/gif, image/jpeg, image/png, image/webp"
        maxFileSize={MAX_FILE_UPLOAD}
        customUpload
        uploadHandler={props.uploadHandler}
        chooseLabel={"Upload Cover Image"}
      />
    </div>
  );
}
