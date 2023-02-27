import { priceBodyTemplate } from "../../util/TableCellEditFuncs";

interface TotalDollarsProps {
  label: string;
  totalDollars: number;
}

export default function TotalDollars(props: TotalDollarsProps) {
  return (
    <div className="flex">
      <label
        className="p-component p-text-secondary my-auto text-teal-900 pr-2"
        htmlFor="totalcost"
      >
        {props.label}
      </label>
      <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
        {priceBodyTemplate(props.totalDollars ?? 0)}
      </p>
    </div>
  );
}
