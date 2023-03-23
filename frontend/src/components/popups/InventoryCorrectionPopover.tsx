import { RefObject, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from "primereact/inputnumber";
import { Divider } from "primereact/divider";
import { arrowColorDeterminer, colorDeterminer } from "../../util/CSSFunctions";

export interface InventoryCorrectionPopoverProps {
  panelRef: RefObject<OverlayPanel>;
  value: number;
  setDelta: (value: number) => void;
}

export default function InventoryCorrectionPopover(
  props: InventoryCorrectionPopoverProps
) {
  const [tempValue, setTempValue] = useState<number>(0);

  return (
    <OverlayPanel ref={props.panelRef} showCloseIcon>
      <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800); p-0 m-0 pb-3">
        Inventory Correction
      </h1>
      <div className="flex justify-content-around">
        <p className="p-component p-text-secondary text-900 text-2xl text-center my-0">
          {props.value}
        </p>
        <span
          className="pi pi-arrow-right text-xl my-auto font-semibold"
          style={arrowColorDeterminer(tempValue)}
        ></span>
        <p
          className={
            "p-component p-text-secondary text-2xl text-center my-0 " +
            colorDeterminer(tempValue)
          }
        >
          {props.value + tempValue}
        </p>
      </div>
      <Divider />
      <div className="flex">
        <InputNumber
          value={tempValue}
          onValueChange={(e: InputNumberValueChangeEvent) =>
            setTempValue(e.value ?? 0)
          }
          mode="decimal"
          showButtons
          buttonLayout="horizontal"
          step={1}
          decrementButtonClassName="p-button-danger"
          incrementButtonClassName="p-button-success"
          incrementButtonIcon="pi pi-plus"
          decrementButtonIcon="pi pi-minus"
          allowEmpty={false}
        />
      </div>
      <div className="flex justify-content-end mt-4">
        <Button
          type="button"
          label="Update"
          className="p-button-sm"
          onClick={() => {
            props.setDelta(tempValue);
            props.panelRef.current?.hide();
          }}
        />
      </div>
    </OverlayPanel>
  );
}
