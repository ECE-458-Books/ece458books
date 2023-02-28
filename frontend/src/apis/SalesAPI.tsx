import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "./Config";

const SALES_EXTENSION = "sales/sales_reconciliation";

// getSalesReconciliations
export interface GetSRsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface APISRSaleRow {
  id?: number; // ID only for new rows, not already existing ones
  book: number;
  book_title: string;
  book_isbn: string;
  quantity: number;
  unit_retail_price: number;
}

export interface APISR {
  id: number;
  date: string;
  sales: APISRSaleRow[];
  num_books: number;
  num_unique_books: number;
  total_revenue: number;
}

export interface GetSRsResp {
  results: APISR[];
  count: number;
}

// getSalesReconciliationDetail
export interface GetSRDetailReq {
  id: string;
}

// deleteSalesReconciliation
export interface DeleteSRReq {
  id: string;
}

// addSalesReconciliation
export interface AddSRReq {
  date: string;
  sales: APISRSaleRow[];
}

// modifySalesReconciliation
export interface ModifySRReq extends AddSRReq {
  id: string;
}

// salesReconciliationsCSVImport
export interface SRCSVImportReq {
  file: File;
}

export interface APISaleCSVImportRow extends APISRSaleRow {
  errors: { [key: string]: string };
}

export interface SRCSVImportResp {
  sales: APISaleCSVImportRow[];
  errors: string[];
}

export const SALES_API = {
  getSalesReconciliations: async function (
    req: GetSRsReq
  ): Promise<GetSRsResp> {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getSalesReconciliationDetail: async function (
    req: GetSRDetailReq
  ): Promise<APISR> {
    return await API.request({
      url: SALES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteSalesReconciliation: async function (req: DeleteSRReq) {
    return await API.request({
      url: SALES_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_DELETE,
    });
  },

  modifySalesReconciliation: async function (req: ModifySRReq) {
    return await API.request({
      url: SALES_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addSalesReconciliation: async function (req: AddSRReq) {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },

  salesReconciliationCSVImport: async function (
    req: SRCSVImportReq
  ): Promise<SRCSVImportResp> {
    const formData = new FormData();
    formData.append("file", req.file);
    console.log(formData);
    const request = {
      url: SALES_EXTENSION.concat("/csv/import"), // TODO: This will eventually go back to sales/sales_reconciliation/...
      method: METHOD_POST,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    return await API.request(request);
  },
};
