import { useEffect, useMemo, useState } from "react";
import LoadingBar from "../components/LoadingBar";
import ItemsTable from "../components/ItemsTable";
import PaginationControls from "../components/PaginationControls";
import type { ItemQuery, ItemRow, ItemSortBy, SortOrder } from "../services/items";
import { fetchItems } from "../services/items";

type SearchFilters = {
  itemkey: string;
  desc1: string;
  sort_by: ItemSortBy;
  sort_order: SortOrder;
};

const defaultSearch: SearchFilters = {
  itemkey: "",
  desc1: "",
  sort_by: "itemkey",
  sort_order: "asc",
};

export default function ItemsDashboard() {
  const [search, setSearch] = useState<SearchFilters>(defaultSearch);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<ItemRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const query: ItemQuery = useMemo(() => {
    const q: ItemQuery = {
      page,
      size,
      sort_by: search.sort_by,
      sort_order: search.sort_order,
    };

    if (search.itemkey.trim()) q.itemkey = search.itemkey.trim();
    if (search.desc1.trim()) q.desc1 = search.desc1.trim();

    return q;
  }, [search, page, size]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchItems(query);
        if (cancelled) return;

        if (!data.success) {
          setRows([]);
          setTotalRecords(0);
          setTotalPages(0);
          setError(data.message ?? "Request failed.");
          return;
        }

        setRows(data.data ?? []);
        setTotalRecords(data.total_records ?? 0);
        setTotalPages(data.total_pages ?? 0);
      } catch (err: unknown) {
        if (cancelled) return;
        setRows([]);
        setTotalRecords(0);
        setTotalPages(0);
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          "Could not load items.";
        setError(String(msg));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  function onApplySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function onReset() {
    setSearch(defaultSearch);
    setPage(1);
    setSize(20);
  }

  function setSearchField<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) {
    setSearch((prev) => ({ ...prev, [key]: value }));
  }

  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * size + 1;
  const showingTo = Math.min(page * size, totalRecords);

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-slate-900">Item Master</h1>
          <p className="text-sm text-slate-600">
            Search inventory items from INMAST (item code, description, purchase
            unit of measure).
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">Search</h2>
            <p className="text-sm text-slate-600">
              Item code supports partial search or one or more exact codes
              separated by commas. Description still uses
              <span className="font-medium"> partial search</span>.
            </p>
          </div>

          <form onSubmit={onApplySearch} className="mt-4 grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">Item code</span>
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  placeholder="Search item code(s): ITEM1, ITEM2"
                  value={search.itemkey}
                  onChange={(e) => setSearchField("itemkey", e.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">Description</span>
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  placeholder="Search description (e.g. bearing)"
                  value={search.desc1}
                  onChange={(e) => setSearchField("desc1", e.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Sort by</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  value={search.sort_by}
                  onChange={(e) =>
                    setSearchField("sort_by", e.target.value as ItemSortBy)
                  }
                >
                  <option value="itemkey">Item code</option>
                  <option value="desc1">Description</option>
                  <option value="purchase_uom_code">Purchase UOM</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Sort order</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  value={search.sort_order}
                  onChange={(e) =>
                    setSearchField("sort_order", e.target.value as SortOrder)
                  }
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-medium text-slate-900">{showingFrom}</span>
                –
                <span className="font-medium text-slate-900">{showingTo}</span> of{" "}
                <span className="font-medium text-slate-900">{totalRecords}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={onReset}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mt-6 grid gap-4">
          {loading ? (
            <LoadingBar label="Loading items" />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="font-semibold">Could not load items</div>
              <div className="mt-1">{error}</div>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <div className="text-base font-semibold text-slate-900">
                No items found
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Try a different search term or clear the search fields.
              </div>
            </div>
          ) : (
            <ItemsTable rows={rows} />
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            size={size}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            onSizeChange={(n) => {
              setSize(n);
              setPage(1);
            }}
          />
        </section>
      </main>
    </>
  );
}
