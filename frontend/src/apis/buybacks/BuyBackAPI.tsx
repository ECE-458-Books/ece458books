import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "../Config";

const BUYBACK_EXTENSION = "buybacks";

// getBuyBacks
export interface GetBBsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface GetBBsNoPageReq {
  no_pagination: boolean;
  ordering: string;
}

export interface APIBBSaleRow {
  id?: number; // ID only for new rows, not already existing ones
  book: number;
  book_title: string;
  book_isbn: string;
  quantity: number;
  unit_buyback_price: number;
}

export interface APIBB {
  id: number;
  date: string;
  buybacks: APIBBSaleRow[];
  user: number;
  username: string;
  vendor: number;
  vendor_name: string;
  num_books: number;
  num_unique_books: number;
  is_deletable: boolean;
  total_revenue: number;
}

export interface GetBBsResp {
  results: APIBB[];
  count: number;
}

// getBuyBack
export interface GetBBDetailReq {
  id: string;
}

// deleteBuyBack
export interface DeleteBBReq {
  id: string;
}

// addBuyBack
export interface AddBBReq {
  date: string;
  vendor: number;
  buybacks: APIBBSaleRow[];
}

// modifyBuyBack
export interface ModifyBBReq extends AddBBReq {
  id: string;
}

// salesReconciliationsCSVImport
export interface BBCSVImportReq {
  file: File;
  vendor: string;
}

export interface APIBBCSVImportRow extends APIBBSaleRow {
  isbn_13: string;
  errors: { [key: string]: string };
}

export interface BBCSVImportResp {
  buybacks: APIBBCSVImportRow[];
  errors?: string[];
}

export const BUYBACK_API = {
  getBuyBacks: async function (req: GetBBsReq): Promise<GetBBsResp> {
    return await API.request({
      url: BUYBACK_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBuyBacksNoPagination: async function (
    req: GetBBsNoPageReq
  ): Promise<APIBB[]> {
    return await API.request({
      url: BUYBACK_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getBuyBackDetail: async function (req: GetBBDetailReq): Promise<APIBB> {
    return await API.request({
      url: BUYBACK_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deleteBuyBack: async function (req: DeleteBBReq) {
    return await API.request({
      url: BUYBACK_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_DELETE,
    });
  },

  modifyBuyBack: async function (req: ModifyBBReq) {
    return await API.request({
      url: BUYBACK_EXTENSION.concat("/").concat(req.id.toString()),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addBuyBack: async function (req: AddBBReq) {
    return await API.request({
      url: BUYBACK_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },

  buybackCSVImport: async function (
    req: BBCSVImportReq
  ): Promise<BBCSVImportResp> {
    const formData = new FormData();
    formData.append("file", req.file);
    formData.append("vendor", req.vendor);
    const request = {
      url: BUYBACK_EXTENSION.concat("/csv/import"),
      method: METHOD_POST,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    return await API.request(request);
  },
};
