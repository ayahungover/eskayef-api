import { api } from "./api";

export type ItemSortBy = "itemkey" | "desc1" | "purchase_uom_code";
export type SortOrder = "asc" | "desc";

export type ItemRow = {
  itemkey: string;
  desc1: string | null;
  purchase_uom_code: string | null;
};

export type ItemsResponse = {
  success: boolean;
  page: number;
  size: number;
  total_records: number;
  total_pages: number;
  data: ItemRow[];
  message?: string;
};

export type ItemQuery = {
  page: number;
  size: number;
  itemkey?: string;
  desc1?: string;
  sort_by: ItemSortBy;
  sort_order: SortOrder;
};

export async function fetchItems(query: ItemQuery) {
  const res = await api.get<ItemsResponse>("/items", { params: query });
  return res.data;
}
