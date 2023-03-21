import { API, METHOD_DELETE, METHOD_GET } from "../Config";

const SALES_EXTENSION = "sales/sales_reconciliation";

// getSalesRecords
export interface GetSRsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface GetSRsNoPageReq {
  no_pagination: boolean;
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
  is_deletable: boolean;
}

export interface GetSRsResp {
  results: APISR[];
  count: number;
}

// getSalesRecordDetail
export interface GetSRDetailReq {
  id: string;
}

// deleteSalesRecord
export interface DeleteSRReq {
  id: string;
}

export const SALES_API = {
  getSalesRecords: async function (req: GetSRsReq): Promise<GetSRsResp> {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getSalesRecordsNoPagination: async function (
    req: GetSRsNoPageReq
  ): Promise<APISR[]> {
    return await API.request({
      url: SALES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getSalesRecordDetail: async function (req: GetSRDetailReq): Promise<APISR> {
    return await API.request({
      url: SALES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteSalesRecord: async function (req: DeleteSRReq) {
    return await API.request({
      url: SALES_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_DELETE,
    });
  },
};
