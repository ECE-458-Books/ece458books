import { DataTable } from "primereact/datatable";
import { useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import ConfirmPopup from "../../components/ConfirmPopup";
import moment from "moment";
import { GetSalesReportResp, SALES_REPORT_API } from "../../apis/SalesRepAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { APIToInternalSalesReportConversion } from "../../apis/Conversions";
import { createColumns, TableColumn } from "../../components/Table";
import { priceBodyTemplate } from "../../util/TableCellEditFuncs";

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

const COLUMNS_TOTAL: TableColumn[] = [
  {
    field: "revenue",
    header: "Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      priceBodyTemplate(rowData.revenue),
  },
  {
    field: "cost",
    header: "Cost",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      priceBodyTemplate(rowData.cost),
  },
  {
    field: "profit",
    header: "Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      priceBodyTemplate(rowData.profit),
  },
];

const COLUMNS_DAILY: TableColumn[] = [
  { field: "date", header: "Date (YYYY-MM-DD)" },
  {
    field: "revenue",
    header: "Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportDailyRow) =>
      priceBodyTemplate(rowData.revenue),
  },
  {
    field: "cost",
    header: "Cost",
    style: { width: "25%" },
    customBody: (rowData: SalesReportDailyRow) =>
      priceBodyTemplate(rowData.cost),
  },
  {
    field: "profit",
    header: "Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportDailyRow) =>
      priceBodyTemplate(rowData.profit),
  },
];

const COLUMNS_TOP_BOOKS: TableColumn[] = [
  { field: "bookTitle", header: "Book", style: { width: "25%" } },
  {
    field: "numBooksSold",
    header: "Number of Books Sold",
    style: { width: "25%" },
  },
  {
    field: "bookRevenue",
    header: "Book Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTopBooksRow) =>
      priceBodyTemplate(rowData.bookRevenue),
  },
  {
    field: "totalCostMostRecent",
    header: "Book Cost - Most Recent",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTopBooksRow) =>
      priceBodyTemplate(rowData.totalCostMostRecent),
  },
  {
    field: "bookProfit",
    header: "Book Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTopBooksRow) =>
      priceBodyTemplate(rowData.bookProfit),
  },
];

const columnsTotal = createColumns(COLUMNS_TOTAL);
const columnsDaily = createColumns(COLUMNS_DAILY);
const columnsTopBooks = createColumns(COLUMNS_TOP_BOOKS);

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
            {columnsTotal}
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
            {columnsDaily}
          </DataTable>
        </div>
        <div className="pt-3 col-12 justify-content-center align-content-center">
          <h1 className="p-component p-text-secondary text-3xl text-center text-900 color: var(--surface-800);">
            Top Book Total Summary
          </h1>
        </div>
        <div className="col-offset-2 col-8">
          <DataTable value={topBooksData} className="">
            {columnsTopBooks}
          </DataTable>
        </div>
      </div>
    </div>
  );
}
