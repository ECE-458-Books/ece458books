import {
  API,
  METHOD_DELETE,
  METHOD_GET,
  METHOD_PATCH,
  METHOD_POST,
} from "../Config";

const PURCHASES_EXTENSION = "purchase_orders";

// getPurchaseOrders

export interface GetPOsReq {
  page: number;
  page_size: number;
  ordering: string;
}

export interface GetPOsNoPageReq {
  no_pagination: boolean;
  ordering: string;
}

export interface APIPOPurchaseRow {
  id?: number; // ID only for new rows, not already existing ones
  book: number;
  book_title: string;
  book_isbn: string;
  quantity: number;
  unit_wholesale_price: number;
}

export interface APIPO {
  vendor_name: string;
  is_deletable: boolean;
  user: number;
  username: string;
  id: number;
  date: string;
  vendor_id: number;
  purchases: APIPOPurchaseRow[];
  num_books: number;
  num_unique_books: number;
  total_cost: number;
}

export interface GetPOsResp {
  results: APIPO[];
  count: number;
}

// getPurchaseOrderDetail
export interface GetPODetailReq {
  id: string;
}

// deletePurchaseOrders
export interface DeletePOReq {
  id: string;
}

// addPurchaseOrders
export interface AddPOReq {
  date: string;
  vendor: number;
  purchases: APIPOPurchaseRow[];
}

// modifyPurchaseOrders
export interface ModifyPOReq extends AddPOReq {
  id: string;
}

// puchaseOrdersCSVImport
export interface POCSVImportReq {
  file: File;
}

export interface APIPurchaseCSVImportRow extends APIPOPurchaseRow {
  isbn_13: string;
  errors: { [key: string]: string };
}

export interface POCSVImportResp {
  purchases: APIPurchaseCSVImportRow[];
  errors?: string[];
}

export const PURCHASES_API = {
  getPurchaseOrders: async function (req: GetPOsReq): Promise<GetPOsResp> {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getPurchaseOrdersNoPagination: async function (
    req: GetPOsNoPageReq
  ): Promise<APIPO[]> {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_GET,
      params: req,
    });
  },

  getPurchaseOrderDetail: async function (req: GetPODetailReq): Promise<APIPO> {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_GET,
    });
  },

  deletePurchaseOrder: async function (req: DeletePOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_DELETE,
    });
  },

  modifyPurchaseOrder: async function (req: ModifyPOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION.concat("/".concat(req.id.toString())),
      method: METHOD_PATCH,
      data: req,
    });
  },

  addPurchaseOrder: async function (req: AddPOReq) {
    return await API.request({
      url: PURCHASES_EXTENSION,
      method: METHOD_POST,
      data: req,
    });
  },

  purchaseOrderCSVImport: async function (
    req: POCSVImportReq
  ): Promise<POCSVImportResp> {
    const formData = new FormData();
    formData.append("file", req.file);
    const request = {
      url: PURCHASES_EXTENSION.concat("/csv/import"),
      method: METHOD_POST,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };
    return await API.request(request);
  },
};
