import { Tag } from "primereact/tag";
import { ReactElement } from "react";

// These are the possible 400 level error keys, and will result in the CSV import data not being displayed
// Each one is present when a column with that name is missing from the CSV file, and the error will
// be displayed with a toast message
export const CSVImport400Errors = new Map<string, string>([
  ["isbn_13 ", "ISBN 13 Column Missing from the CSV"],
  ["quantity", "Quantity Column Missing from the CSV"],
  ["unit_buyback_price", "Unit Buyback Price Column Missing from the CSV"],
  ["unit_retail_price", "Unit Retail Price Column Missing from the CSV"],
  ["unit_wholesale_price ", "Unit Wholesale Price Column Missing from the CSV"],
]);

// These are the possible 200 (success) error keys NOT at the row level, and will result
// in a warning message but a successful CSV import. The warning will be displayed with a toast message
export const CSVImport200Errors = new Map<string, string>([
  ["extra_column", "Extra Column present in the CSV"],
]);

// These are the possible 200 (success) error keys at the row level, and will result
// in tags being shown in the rows with the errors
export function CSVImport200RowErrors(
  field: string,
  error: string
): ReactElement {
  switch (error) {
    case "incorrect_format":
      return (
        <Tag
          severity="danger"
          icon="pi pi-book"
          value={field.concat(" Incorrect Format")}
          key={field}
        />
      );
    case "not_in_db":
      return (
        <Tag icon="pi pi-database" value="Book Not in System" key={field} />
      );
    case "quantity_below_0":
      return (
        <Tag
          severity="warning"
          icon="pi pi-pencil"
          value="Book Quantity Below 0"
          key={field}
        />
      );
    case "not_sold_by_vendor":
      return (
        <Tag
          severity="info"
          icon="pi pi-briefcase"
          value="Book Not Sold by Vendor"
          key={field}
        />
      );
    default:
      return <Tag severity="warning" value="Unknown Error" />;
  }
}

export const errorCellBody = (
  errors: { [key: string]: string } | undefined
): ReactElement[] => {
  const errorTags: ReactElement[] = [];
  for (const key in errors) {
    const tag = CSVImport200RowErrors(key, errors[key]);
    errorTags.push(tag);
  }
  return errorTags;
};