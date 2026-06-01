import { api } from "./api";

export type SortBy = "IndentDate" | "RequestedBy" | "Price" | "Qtyord";
export type SortOrder = "asc" | "desc";

export type RequisitionRow = {
  IndentNo1?: string | null;
  IndentDate?: string | null;
  IndentNo?: string | null;
  RowNum?: number | null;
  Itemkey?: string | null;
  Desc1?: string | null;
  Specification?: string | null;
  Qtyord?: number | null;
  UOM?: string | null;
  Price?: number | null;
  RequiredDate?: string | null;
  RequestedBy?: string | null;
};

export type RequisitionsResponse = {
  success: boolean;
  page: number;
  size: number;
  total_records: number;
  total_pages: number;
  data: RequisitionRow[];
  message?: string;
};

export type RequisitionQuery = {
  page: number;
  size: number;
  indent_no?: string;
  sort_by: SortBy;
  sort_order: SortOrder;
};

export async function fetchRequisitions(query: RequisitionQuery) {
  const res = await api.get<RequisitionsResponse>("/requisitions", {
    params: query,
  });
  return res.data;
}
