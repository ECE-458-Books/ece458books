import { FileUpload, FileUploadHandlerEvent } from "primereact/fileupload";

const MAX_FILE_UPLOAD = 1000000; // Bytes

interface CSVUploaderProps {
  uploadHandler: (e: FileUploadHandlerEvent) => void;
  visible: boolean;
  disabled?: boolean;
}

export default function CSVUploader(props: CSVUploaderProps) {
  return (
    <>
      {props.visible && (
        <div className="card flex justify-content-center">
          <FileUpload
            auto
            mode="basic"
            accept=".csv"
            maxFileSize={MAX_FILE_UPLOAD}
            customUpload
            disabled={props.disabled ?? false}
            uploadHandler={props.uploadHandler}
            chooseLabel={"Import CSV"}
          />
        </div>
      )}
    </>
  );
}
