import { showFailure } from "../Toast";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const END_USER_CSV_URL = "https://books-test.colab.duke.edu/media/books/csv.pdf";

interface CSVEndUserDocButtonProps {
  toast: React.RefObject<Toast>;
  className?: string;
  visible: boolean;
}

export default function CSVEndUserDocButton(props: CSVEndUserDocButtonProps) {
  const callCSVHelpGuideAPI = () => {
    try {
      window.open(END_USER_CSV_URL, "_blank");
    } catch (error) {
      showFailure(props.toast, "Could not fetch CSV User Help Guide");
    }
  };

  return (
    <Button
      type="button"
      icon="pi pi-question"
      visible={props.visible}
      onClick={callCSVHelpGuideAPI}
      className={"p-button-rounded my-auto" + props.className}
      tooltip="Click for CSV Import Help Guide"
      tooltipOptions={{ showDelay: 1000, hideDelay: 300 }}
    />
  );
}
