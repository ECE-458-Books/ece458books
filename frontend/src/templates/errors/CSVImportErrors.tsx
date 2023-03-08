import { Tag } from "primereact/tag";
import { ReactElement } from "react";

// These are the possible 400 level error keys, and will result in the CSV import data not being displayed
// Each one is present when a column with that name is missing from the CSV file, and the error will
// be displayed with a toast message
export const CSVImport400Errors = new Map<string, string>([
  ["isbn_13", "ISBN 13 Column Missing from the CSV"],
  ["quantity", "Quantity Column Missing from the CSV"],
  ["unit_buyback_price", "Unit Buyback Price Column Missing from the CSV"],
  ["unit_retail_price", "Unit Retail Price Column Missing from the CSV"],
  ["unit_wholesale_price", "Unit Wholesale Price Column Missing from the CSV"],
  ["duplicate_valid_headers", "Duplicate headers are present in the CSV"],
  ["empty_csv", "CSV file is empty"],
]);

export function CSVImport400OverallErrors(error: string): string {
  console.log(error.includes("Expected"));
  switch (true) {
    case error.includes("isbn"):
      return "ISBN 13 Column Missing from the CSV";
    case error.includes("quantity"):
      return "Quantity Column Missing from the CSV";
    case error.includes("unit_buyback_price"):
      return "Unit Buyback Price Column Missing from the CSV";
    case error.includes("unit_retail_price"):
      return "Unit Retail Price Column Missing from the CSV";
    case error.includes("unit_wholesale_price"):
      return "Unit Wholesale Price Column Missing from the CSV";
    case error.includes("duplicate_valid_headers"):
      return "Duplicate headers are present in the CSV";
    case error.includes("empty_csv"):
      return "CSV file is empty";
    case error.includes("Expected"):
      // eslint-disable-next-line no-case-declarations
      const lineNum = error.split(" ")[5];
      return `Row ${lineNum} is invalid`;
    default:
      return "Unknown Error";
  }
}

export function CSVImport200OverallErrors(error: string): string {
  return error.concat(" is an extra column and was not used");
}

// These are the possible 200 (success) error keys at the row level, and will result
// in tags being shown in the rows with the errors
// Danger = Book issue
// Warning = Format issue (negative, NAN, etc)
export function CSVImport200RowErrors(
  field: string,
  error: string
): ReactElement {
  switch (true) {
    case error === "invalid_isbn":
      return (
        <Tag
          severity="danger"
          icon="pi pi-book"
          value={"Invalid ISBN"}
          key={field}
        />
      );
    case error === "not_in_db":
      return (
        <Tag
          severity="danger"
          icon="pi pi-database"
          value="Book Not in System"
          key={field}
        />
      );
    case error.includes("insufficient_stock"):
      // eslint-disable-next-line no-case-declarations
      const stock = error.split("_")[2];
      return (
        <Tag
          severity="danger"
          icon="pi pi-chart-bar"
          value={`Book Stock is only ${stock}`}
          key={field}
        />
      );
    case error === "not_an_int":
      return (
        <Tag
          severity="warning"
          icon="pi pi-hashtag"
          value={field.concat(" must be an integer")}
          key={field}
        />
      );
    case error === "not_a_number":
      return (
        <Tag
          severity="warning"
          icon="pi pi-hashtag"
          value={field.concat(" must be an number")}
          key={field}
        />
      );
    case error === "negative":
      return (
        <Tag
          severity="warning"
          icon="pi pi-plus"
          value={field.concat(" can't be negative")}
          key={field}
        />
      );
    case error === "empty_value":
      return (
        <Tag
          severity="info"
          icon="pi pi-briefcase"
          value={field.concat(" is empty")}
          key={field}
        />
      );
    case error === "book_not_sold_by_vendor":
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
): JSX.Element[] => {
  const errorTags: JSX.Element[] = [];
  for (const key in errors) {
    const tag = CSVImport200RowErrors(key, errors[key]);
    errorTags.push(tag);
  }
  return errorTags;
};
