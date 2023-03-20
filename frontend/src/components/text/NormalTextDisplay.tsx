interface NormalTextDisplayProps {
  value: string | number;
}

export function NormalTextDisplay(props: NormalTextDisplayProps): JSX.Element {
  return <div>{props.value}</div>;
}
