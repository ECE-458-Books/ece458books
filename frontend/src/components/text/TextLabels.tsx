interface TextLabelProps {
  label: string;
  labelClassName?: string;
}

export default function TextLabel(props: TextLabelProps) {
  return (
    <label
      className={
        props.labelClassName ??
        "p-component p-text-secondary text-teal-900 my-auto mr-2"
      }
      htmlFor={"bookdetail " + props.label}
    >
      {props.label}
    </label>
  );
}
