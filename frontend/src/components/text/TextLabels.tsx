interface TextLabelProps {
  label: string;
  labelClassName?: string;
}

export default function TextLabel(props: TextLabelProps) {
  return (
    <label
      className={
        "p-component p-text-secondary text-teal-900 my-auto mr-2 " +
        props.labelClassName
      }
      htmlFor={"bookdetail " + props.label}
    >
      {props.label}
    </label>
  );
}
