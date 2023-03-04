export default function AlteredTextTemplate(
  className: string,
  text: string | number | undefined
) {
  return <label className={className}>{text}</label>;
}
