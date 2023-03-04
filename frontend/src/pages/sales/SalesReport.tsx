import { DataTable } from "primereact/datatable";
import { FormEvent, useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import {
  GetSalesReportResp,
  SALES_REPORT_API,
} from "../../apis/salesreport/SalesRepAPI";
import { Toast } from "primereact/toast";
import { logger } from "../../util/Logger";
import { APIToInternalSalesReportConversion } from "../../apis/salesreport/SalesReportConversions";
import {
  createColumns,
  TableColumn,
} from "../../components/datatable/TableColumns";
import PriceTemplate from "../../components/templates/PriceTemplate";
import { Button } from "primereact/button";

export interface SalesReport {
  totalRow: SalesReportTotalRow;
  dailySummaryRows: SalesReportDailyRow[];
  topBooksRows: SalesReportTopBooksRow[];
}

export interface SalesReportTotalRow {
  salesRevenue: number;
  buybacksRevenue: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface SalesReportDailyRow {
  date: string;
  salesRevenue: number;
  buybacksRevenue: number;
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
    field: "salesRevenue",
    header: "Sales Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      PriceTemplate(rowData.salesRevenue),
  },
  {
    field: "buybacksRevenue",
    header: "Buyback Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      PriceTemplate(rowData.buybacksRevenue),
  },
  {
    field: "revenue",
    header: "Total Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      PriceTemplate(rowData.revenue),
  },
  {
    field: "cost",
    header: "Cost",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) => PriceTemplate(rowData.cost),
  },
  {
    field: "profit",
    header: "Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) => PriceTemplate(rowData.profit),
  },
];

const COLUMNS_DAILY: TableColumn[] = [
  { field: "date", header: "Date (YYYY-MM-DD)" },
  {
    field: "salesRevenue",
    header: "Sales Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      PriceTemplate(rowData.salesRevenue),
  },
  {
    field: "buybacksRevenue",
    header: "Buyback Revenue",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTotalRow) =>
      PriceTemplate(rowData.buybacksRevenue),
  },
  {
    field: "cost",
    header: "Cost",
    style: { width: "25%" },
    customBody: (rowData: SalesReportDailyRow) => PriceTemplate(rowData.cost),
  },
  {
    field: "profit",
    header: "Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportDailyRow) => PriceTemplate(rowData.profit),
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
      PriceTemplate(rowData.bookRevenue),
  },
  {
    field: "totalCostMostRecent",
    header: "Book Cost - Most Recent",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTopBooksRow) =>
      PriceTemplate(rowData.totalCostMostRecent),
  },
  {
    field: "bookProfit",
    header: "Book Profit",
    style: { width: "25%" },
    customBody: (rowData: SalesReportTopBooksRow) =>
      PriceTemplate(rowData.bookProfit),
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

  const onAPIResponse = (response: GetSalesReportResp) => {
    const salesReport = APIToInternalSalesReportConversion(response);
    //console.log(salesReport);
    setTotalsData([salesReport.totalRow]);
    setDailyData(salesReport.dailySummaryRows);
    setTopBooksData(salesReport.topBooksRows.slice(0, 10));
  };

  // Toast is used for showing success/error messages
  const toast = useRef<Toast>(null);

  const showFailure = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: message,
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    try {
      if (dates != null) {
        if (moment(dates[1]).format("YYYY-MM-DD") !== "Invalid date") {
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
    event.preventDefault();
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
            <div className="flex pb-2 justify-content-evenly card-container">
              <div className="flex col-4 p-0 m-0">
                <label
                  htmlFor="date"
                  className="flex p-component p-text-secondary text-center text-teal-900 my-auto mr-2 p-0"
                >
                  Date Range:
                </label>
                <Calendar
                  value={dates}
                  onChange={(e) => setDates(e.value)}
                  selectionMode="range"
                  required
                  readOnlyInput
                  showButtonBar
                  placeholder="Start - End"
                  className="p-datepicker-current-day w-8"
                />
              </div>

              <Button
                label="Generate"
                type="submit"
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
          <DataTable value={dailyData} size="small" className="">
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
