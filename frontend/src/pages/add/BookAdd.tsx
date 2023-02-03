import React, { FormEvent } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import FormData from "form-data";
import { DataTable } from "primereact/datatable";
import { Column, ColumnEditorOptions } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { TableColumn } from "../../components/Table";
import { InputNumber } from "primereact/inputnumber";

interface BookAddState {
  value: string;
  data: BookRow[];
}

interface BookRow {
  title: string;
  authors: string;
  isbn: string;
  publisher: string;
  pubYear: number;
  pageCount: number;
  dimensions: string;
  retailPrice: number;
  genre: string;
}

const DATA: BookRow[] = [
  {
    title: "blah",
    authors: "blah",
    isbn: "blah",
    publisher: "blah",
    pubYear: 2000,
    pageCount: 3029,
    dimensions: "blah",
    retailPrice: 11.99,
    genre: "blah",
  },
  {
    title: "clah",
    authors: "clah",
    isbn: "clah",
    publisher: "clah",
    pubYear: 2000,
    pageCount: 3029,
    dimensions: "clah",
    retailPrice: 11.9,
    genre: "clah",
  },
];

const COLUMNS: TableColumn[] = [
  { field: "title", header: "Title", filterPlaceholder: "Search by Title" },
  {
    field: "authors",
    header: "Authors",
    filterPlaceholder: "Search by Authors",
  },
  { field: "isbn", header: "ISBN", filterPlaceholder: "Search by ISBN" },
  {
    field: "publisher",
    header: "Publisher",
    filterPlaceholder: "Search by Publisher",
    hidden: true,
  },
  {
    field: "pubYear",
    header: "Publication Year",
    filterPlaceholder: "Search by Publication Year",
    hidden: true,
  },
  {
    field: "pageCount",
    header: "Page Count",
    filterPlaceholder: "Search by Page Count",
    hidden: true,
  },
  {
    field: "dimensions",
    header: "Dimensions",
    filterPlaceholder: "Search by Dimensions",
    hidden: true,
  },
  {
    field: "retailPrice",
    header: "Retail Price",
    filterPlaceholder: "Search by Price",
  },
  {
    field: "genre",
    header: "Genre",
    filterPlaceholder: "Search by Genre",
  },
];

class BookAdd extends React.Component<{}, BookAddState> {
  constructor(props = {}) {
    super(props);
    this.state = { value: "", data: DATA };
  }

  isPositiveInteger = (val: any) => {
    let str = String(val);

    str = str.trim();

    if (!str) {
      return false;
    }

    str = str.replace(/^0+/, "") || "0";
    const n = Number(str);

    return n !== Infinity && String(n) === str && n >= 0;
  };

  onCellEditComplete = (e: {
    rowData: any;
    newValue: any;
    field: any;
    originalEvent: any;
  }) => {
    const { rowData, newValue, field, originalEvent: event } = e;

    switch (field) {
      case "pubYear":
        if (this.isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "pageCount":
        if (this.isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      case "retailPrice":
        if (this.isPositiveInteger(newValue)) rowData[field] = newValue;
        else event.preventDefault();
        break;
      default:
        if (newValue.trim().length > 0) rowData[field] = newValue;
        else event.preventDefault();
        break;
    }
  };

  cellEditor = (options: ColumnEditorOptions) => {
    switch (options.field) {
      case "pubYear":
        return this.numberEditor(options);
      case "pageCount":
        return this.numberEditor(options);
      case "retailPrice":
        return this.priceEditor(options);
      default:
        return this.textEditor(options);
    }
  };

  numberEditor = (options: any) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.target.value)}
        mode="decimal"
      />
    );
  };

  textEditor = (options: any) => {
    return (
      <InputText
        type="text"
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  priceEditor = (options: any) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.target.value)}
        mode="currency"
        currency="USD"
        locale="en-US"
      />
    );
  };

  priceBodyTemplate = (rowData: { retailPrice: number | bigint }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(rowData.retailPrice);
  };

  onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("A form was submitted: \n" + this.state.value);
  };

  onCompleteSubmit = (event: FormEvent<HTMLFormElement>): void => {
    alert("Form Data" + JSON.stringify(DATA));
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="addbook">Add Books (ISBN'S)</label>
          <InputTextarea
            id="addbook"
            name="addbook"
            value={this.state.value}
            onChange={(e: FormEvent<HTMLTextAreaElement>) =>
              this.setState({ value: e.currentTarget.value })
            }
            rows={5}
            cols={30}
          />
          <Button
            id="addbooksubmission"
            name="addbooksubmission"
            label="Submit"
            type="submit"
          />
        </form>
        <label htmlFor="addbookcompletion">Finish Book Addition</label>
        <form onSubmit={this.onCompleteSubmit}>
          <DataTable
            value={DATA}
            editMode="cell"
            className="editable-cells-table"
            responsiveLayout="scroll"
          >
            {COLUMNS.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={field === "retailPrice" && this.priceBodyTemplate}
                  editor={(options) => this.cellEditor(options)}
                  onCellEditComplete={this.onCellEditComplete}
                />
              );
            })}
          </DataTable>
          <Button
            id="confirmbooks"
            name="confirmbooks"
            label="Confirm Addition"
            type="submit"
          />
        </form>
      </div>
    );
  }
}

export default BookAdd;
