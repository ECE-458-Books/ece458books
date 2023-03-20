import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { ColumnMeta } from "../../pages/books/BookList";
import { Divider } from "primereact/divider";

interface ToggleColumnPopupProps {
  onConfirm: () => void;
  setIsVisible: (arg0: boolean) => void;
  onOptionChange: (e: CheckboxChangeEvent) => void;
  onSelectAllChange: (e: CheckboxChangeEvent) => void;
  className?: string;
  optionsList: ColumnMeta[];
  selectedOptions: ColumnMeta[];
}

export default function ToggleColumnPopup(props: ToggleColumnPopupProps) {
  // Buttons that are shown on the bottom of the pop-up
  const toggleColumnPopDialogFooter = (
    <>
      <Button
        label="Done"
        icon="pi pi-check"
        type="button"
        onClick={props.onConfirm}
      />
    </>
  );

  return (
    <Dialog
      visible={true}
      style={{ width: "450px" }}
      header="Select Columns to Display"
      modal
      className={"p-fluid" + props.className}
      footer={toggleColumnPopDialogFooter}
      onHide={() => props.setIsVisible(false)}
    >
      <div className="card flex justify-content-center">
        <div key={"selectAll"} className="flex align-items-center">
          <Checkbox
            inputId="selectALL"
            name="option"
            value="Select All"
            onChange={props.onSelectAllChange}
            checked={props.selectedOptions.length === props.optionsList.length}
          />
          <label htmlFor={"selectAll"} className="ml-2">
            {"Select All"}
          </label>
        </div>
      </div>
      <Divider />
      <div className="card flex justify-content-center">
        <div className="flex flex-column gap-3">
          {props.optionsList.map((option) => {
            return (
              <div key={option.field} className="flex align-items-center">
                <Checkbox
                  inputId={option.field}
                  name="option"
                  value={option}
                  onChange={props.onOptionChange}
                  checked={props.selectedOptions.some(
                    (item) => item.field === option.field
                  )}
                />
                <label htmlFor={option.field} className="ml-2">
                  {option.header}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
