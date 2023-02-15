import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import ConfirmPopup from "../../components/ConfirmPopup";
import moment from "moment";
import { GetSalesReportResp, SALES_REPORT_API } from "../../apis/SalesRepAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { APIToInternalSalesReportConversion } from "../../apis/Conversions";

export interface SalesReport {
  totalRow: SalesReportTotalRow;
  dailySummaryRows: SalesReportDailyRow[];
  topBooksRows: SalesReportTopBooksRow[];
}

export interface SalesReportTotalRow {
  revenue: number;
  cost: number;
  profit: number;
}

export interface SalesReportDailyRow {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface SalesReportTopBooksRow {
  bookId: number;
  numBooksSold: number;
  bookRevenue: number;
  totalCostMostRecent: number;
  bookTitle: string;
  bookProfit: number;
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
  { field: "date", header: "Date (YYYY-MM-DD)" },
  { field: "revenue", header: "Revenue" },
  { field: "cost", header: "Cost" },
  { field: "profit", header: "Profit" },
];

const COLUMNS_TOP_BOOKS: TableColumnSales[] = [
  { field: "bookTitle", header: "Book" },
  { field: "bookId", header: "id" },
  { field: "numBooksSold", header: "Number of Books Sold" },
  { field: "bookRevenue", header: "Book Revenue" },
  { field: "totalCostMostRecent", header: "Book Cost - Most Recent" },
  { field: "bookProfit", header: "Book Profit" },
];

export default function SalesReport() {
  const [totalsData, setTotalsData] = useState<SalesReportTotalRow[]>([]);
  const [dailyData, setDailyData] = useState<SalesReportDailyRow[]>([]);
  const [topBooksData, setTopBooksData] = useState<SalesReportTopBooksRow[]>(
    []
  );
  const [dates, setDates] = useState<any>(null);
  const [isConfirmationPopupVisible, setIsConfirmationPopupVisible] =
    useState<boolean>(false);

  const onAPIResponse = (response: GetSalesReportResp) => {
    const salesReport = APIToInternalSalesReportConversion(response);
    console.log(salesReport);
    setTotalsData([salesReport.totalRow]);
    setDailyData(salesReport.dailySummaryRows);
    setTopBooksData(salesReport.topBooksRows);
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showFailure = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: message,
    });
  };

  const formatCurrency = (value: any) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  const priceBodyTemplateRevenue = (rowData: any) => {
    return formatCurrency(rowData.revenue);
  };
  const priceBodyTemplateCost = (rowData: any) => {
    return formatCurrency(rowData.cost);
  };
  const priceBodyTemplateProfit = (rowData: any) => {
    return formatCurrency(rowData.profit);
  };

  const priceBodyTemplateBookRevenue = (rowData: any) => {
    return formatCurrency(rowData.book_revenue);
  };
  const priceBodyTemplateBookCost = (rowData: any) => {
    return formatCurrency(rowData.total_cost_most_recent);
  };
  const priceBodyTemplateBookProfit = (rowData: any) => {
    return formatCurrency(rowData.book_profit);
  };

  const onSubmit = (): void => {
    try {
      if (dates != null) {
        if (moment(dates[1]).format("YYYY-MM-DD") !== "Invalid date") {
          //console.log(moment(new Date()).format("YYYY-MM-DD"));
          // console.log(moment(dates[0]).format("YYYY-MM-DD"));
          // console.log(moment(dates[1]).format("YYYY-MM-DD"));
          logger.debug("Sales Report Requested");
          SALES_REPORT_API.getSalesReport({
            start: moment(dates[0]).format("YYYY-MM-DD"),
            end: moment(dates[1]).format("YYYY-MM-DD"),
          })
            .then((response) => onAPIResponse(response))
            .catch(() => showFailure("Error retrieving sales report"));
        } else {
          showFailure("Select end date");
        }
      } else {
        showFailure("No Date Range selected");
      }
    } catch (error) {
      showFailure("Select end date");
      logger.debug(error);
    }
  };

  return (
    <div className="grid flex justify-content-center">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="py-2">
          <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
            Sales Report
          </h1>
          <form onSubmit={onSubmit}>
            <div className="flex pb-2 flex-row justify-content-evenly card-container">
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

              <ConfirmPopup
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
        </div>
      </div>
      <div className="pt-3 col-12 justify-content-center">
        <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
          Totals Summary
        </h1>
      </div>
      <div className="pt-3 col-12 justify-content-center">
        <div className="justify-content-center col-offset-3 col-6">
          <DataTable value={totalsData} className="">
            {COLUMNS_TOTAL.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={
                    (field === "revenue" && priceBodyTemplateRevenue) ||
                    (field === "cost" && priceBodyTemplateCost) ||
                    (field === "profit" && priceBodyTemplateProfit)
                  }
                />
              );
            })}
          </DataTable>
        </div>
      </div>
      <div className="pt-3 col-12 justify-content-center">
        <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
          Daily Summary
        </h1>
      </div>
      <div className="pt-3 col-12 justify-content-center">
        <div className="col-offset-2 col-8">
          <DataTable value={dailyData} className="">
            {COLUMNS_DAILY.map(({ field, header }) => {
              return (
                <Column
                  key={field}
                  field={field}
                  header={header}
                  style={{ width: "25%" }}
                  body={
                    (field === "revenue" && priceBodyTemplateRevenue) ||
                    (field === "cost" && priceBodyTemplateCost) ||
                    (field === "profit" && priceBodyTemplateProfit)
                  }
                />
              );
            })}
          </DataTable>
        </div>
        <div className="pt-3 col-12 justify-content-center align-content-center">
          <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
            Top Book Total Summary
          </h1>
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
                  hidden={"book_id" === field}
                  body={
                    (field === "book_revenue" &&
                      priceBodyTemplateBookRevenue) ||
                    (field === "total_cost_most_recent" &&
                      priceBodyTemplateBookCost) ||
                    (field === "book_profit" && priceBodyTemplateBookProfit)
                  }
                />
              );
            })}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
