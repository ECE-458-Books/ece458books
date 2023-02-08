import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useState } from "react";
import { Calendar } from "primereact/calendar";
import ConfirmButton from "../../components/ConfirmButton";
import moment from "moment";
import { GetSalesReportResp, SALES_REPORT_API } from "../../apis/SalesRepAPI";

// The structure of the response for a SR from the API
export interface salesReportTotalRow {
  revenue: number;
  cost: number;
  profit: number;
}

export interface salesReportDailyRow {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface salesReportTopBooksRow {
  book_id: number;
  num_books_sold: number;
  book_revenue: number;
  total_cost_most_recent: number;
  book_title: string;
  book_profit: number;
}

export interface TableColumnSales {
  field: string;
  header: string;
}

const COLUMNS_TOTAL: TableColumnSales[] = [
  { field: "revenue", header: "Revenue" },
  { field: "cost", header: "Cost" },
  { field: "profit", header: "Profit" },
];

const COLUMNS_DAILY: TableColumnSales[] = [
  { field: "date", header: "Date" },
  { field: "revenue", header: "Revenue" },
  { field: "cost", header: "Cost" },
  { field: "profit", header: "Profit" },
];

const COLUMNS_TOP_BOOKS: TableColumnSales[] = [
  { field: "book_title", header: "Book" },
  { field: "book_id", header: "id" },
  { field: "num_books_sold", header: "Number of Books Sold" },
  { field: "book_revenue", header: "Book Revenue" },
  { field: "total_cost_most_recent", header: "Book Cost - Most Recent" },
  { field: "book_profit", header: "Book Profit" },
];

export default function SalesReport() {
  const [totalsData, setTotalsData] = useState<salesReportTotalRow[]>([]);
  const [dailyData, setDailyData] = useState<salesReportDailyRow[]>([]);
  const [topBooksData, setTopBooksData] = useState<salesReportTopBooksRow[]>(
    []
  );
  const [dates, setDates] = useState<any>(null);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState(false);

  const onAPIResponse = (response: GetSalesReportResp) => {
    setTotalsData(response.total_summary);
    setDailyData(response.daily_summary);
    setTopBooksData(response.top_books);
  };

  const onSubmit = (): void => {
    try {
      if (dates != null) {
        if (moment(dates[1]).format("YYYY-MM-DD") !== "Invalid date") {
          //console.log(moment(new Date()).format("YYYY-MM-DD"));
          console.log(moment(dates[0]).format("YYYY-MM-DD"));
          console.log(moment(dates[1]).format("YYYY-MM-DD"));
          console.log("Sales Submit");
          SALES_REPORT_API.getSalesReport({
            start: moment(dates[0]).format("YYYY-MM-DD"),
            end: moment(dates[1]).format("YYYY-MM-DD"),
          }).then((response) => onAPIResponse(response));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <div className="col-11">
        <div className="py-2">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Sales Report
          </h1>
          <form onSubmit={onSubmit}>
            <div className="flex pb-2 flex-row justify-content-evenly card-container col-12">
              <div>
                <label
                  htmlFor="date"
                  className="pt-2 pr-2 p-component text-teal-900 p-text-secondary"
                >
                  Date Range:
                </label>
                <Calendar
                  value={dates}
                  onChange={(e) => setDates(e.value)}
                  selectionMode="range"
                  required
                  readOnlyInput
                  className="p-datepicker-current-day"
                />
              </div>

              <ConfirmButton
                isVisible={isConfirmationPopupVisible}
                hideFunc={() => setIsConfirmationPopupVisible(false)}
                acceptFunc={onSubmit}
                rejectFunc={() => {
                  console.log("reject");
                }}
                buttonClickFunc={() => setIsConfirmationPopupVisible(true)}
                disabled={false}
                label={"Generate"}
                className="p-button-success p-button-raised"
              />
            </div>
          </form>

          <div className="col-offset-3 col-6">
            <DataTable value={totalsData} className="">
              {COLUMNS_TOTAL.map(({ field, header }) => {
                return (
                  <Column
                    key={field}
                    field={field}
                    header={header}
                    style={{ width: "25%" }}
                  />
                );
              })}
            </DataTable>
          </div>
          <div className="col-offset-2 col-8">
            <DataTable value={dailyData} className="">
              {COLUMNS_DAILY.map(({ field, header }) => {
                return (
                  <Column
                    key={field}
                    field={field}
                    header={header}
                    style={{ width: "25%" }}
                  />
                );
              })}
            </DataTable>
          </div>
          <div className="col-offset-2 col-8">
            <DataTable value={topBooksData} className="">
              {COLUMNS_TOP_BOOKS.map(({ field, header }) => {
                return (
                  <Column
                    key={field}
                    field={field}
                    header={header}
                    style={{ width: "25%" }}
                  />
                );
              })}
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
