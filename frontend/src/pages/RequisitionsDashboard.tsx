import { useEffect, useMemo, useState } from "react";
import LoadingBar from "../components/LoadingBar";
import PaginationControls from "../components/PaginationControls";
import RequisitionsTable from "../components/RequisitionsTable";
import type {
  RequisitionQuery,
  RequisitionRow,
  SortBy,
  SortOrder,
} from "../services/requisitions";
import { fetchRequisitions } from "../services/requisitions";

type Filters = {
  indent_no: string;
  sort_by: SortBy;
  sort_order: SortOrder;
};

const defaultFilters: Filters = {
  indent_no: "",
  sort_by: "IndentDate",
  sort_order: "desc",
};

export default function RequisitionsDashboard() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<RequisitionRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const query: RequisitionQuery = useMemo(() => {
    const q: RequisitionQuery = {
      page,
      size,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    };

    if (filters.indent_no.trim()) {
      q.indent_no = filters.indent_no.trim();
    }

    return q;
  }, [filters, page, size]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRequisitions(query);
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
        const e = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          "Could not load requisitions.";
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
    setFilters(defaultFilters);
    setPage(1);
    setSize(20);
  }

  const showingFrom = totalRecords === 0 ? 0 : (page - 1) * size + 1;
  const showingTo = Math.min(page * size, totalRecords);

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-slate-900">
              Purchase Requisitions
            </h1>
            <p className="text-sm text-slate-600">
              Search requisition lines by indent number and review results.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-slate-900">Search</h2>
            <p className="text-sm text-slate-600">
              Enter one indent number, or several separated by commas. Example:{" "}
              <span className="font-mono">88371, 88370, 88369</span>
            </p>
          </div>

          <form onSubmit={onApplySearch} className="mt-4 grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">Indent No</span>
                <input
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  placeholder="Search Indent No(s): 88371, 88370"
                  value={filters.indent_no}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, indent_no: e.target.value }))
                  }
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Sort by</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  value={filters.sort_by}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sort_by: e.target.value as SortBy,
                    }))
                  }
                >
                  <option value="IndentDate">Indent Date</option>
                  <option value="RequestedBy">Requested By</option>
                  <option value="Qtyord">Quantity</option>
                  <option value="Price">Price</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Sort order</span>
                <select
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                  value={filters.sort_order}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sort_order: e.target.value as SortOrder,
                    }))
                  }
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-medium text-slate-900">{showingFrom}</span>–
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
            <LoadingBar label="Loading requisitions" />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="font-semibold">Could not load requisitions</div>
              <div className="mt-1">{error}</div>
              <div className="mt-2 text-red-700">
                If you’re running the frontend on port 5173 and the backend on
                port 8000, make sure{" "}
                <span className="font-mono">VITE_API_BASE_URL</span> is correct.
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <div className="text-base font-semibold text-slate-900">
                No results
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Try different indent numbers or clear the search field.
              </div>
            </div>
          ) : (
            <RequisitionsTable rows={rows} />
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
