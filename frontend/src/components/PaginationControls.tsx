type Props = {
  page: number;
  totalPages: number;
  size: number;
  onPrev: () => void;
  onNext: () => void;
  onSizeChange: (size: number) => void;
};

export default function PaginationControls({
  page,
  totalPages,
  size,
  onPrev,
  onNext,
  onSizeChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-700">
        Page <span className="font-semibold">{page}</span> of{" "}
        <span className="font-semibold">{Math.max(totalPages, 1)}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Rows per page
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onPrev}
            disabled={page <= 1}
          >
            Previous
          </button>
          <button
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onNext}
            disabled={totalPages !== 0 && page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}


