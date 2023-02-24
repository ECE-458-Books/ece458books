import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";

interface ImageUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  disabled: boolean;
}

export default function ImageUploader(props: ImageUploaderProps) {
  return (
    <div className="card flex justify-content-center">
      <FileUpload
        mode="advanced"
        name="imageUpload"
        disabled={props.disabled}
        accept="image/gif, image/jpeg, image/png, image/webp"
        customUpload
        uploadHandler={props.uploadHandler}
        chooseLabel={"Upload Cover Image"}
      />
    </div>
  );
}
