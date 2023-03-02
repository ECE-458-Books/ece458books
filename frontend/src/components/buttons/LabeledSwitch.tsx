import { InputSwitch } from "primereact/inputswitch";

interface LabeledSwitchProps {
  label: string;
  value: boolean;
  onChange: () => void;
  className?: string;
}

export default function LabeledSwitch(props: LabeledSwitchProps) {
  return (
    <div className="flex">
      <label
        className="p-component p-text-secondary text-teal-900 my-auto mr-2"
        htmlFor="retail_price"
      >
        {props.label}
      </label>
      <InputSwitch
        checked={props.value}
        id="modifyBookToggle"
        name="modifyBookToggle"
        onChange={props.onChange}
        className={"my-auto " + props.className}
      />
    </div>
  );
}
