import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadOptions,
} from "primereact/fileupload";

interface ImageUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  disabled: boolean;
  chooseOptions?: FileUploadOptions;
  uploadOptions?: FileUploadOptions;
  cancelOptions?: FileUploadOptions;
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
        chooseOptions={props.chooseOptions}
        uploadOptions={props.uploadOptions}
        cancelOptions={props.cancelOptions}
      />
    </div>
  );
}
