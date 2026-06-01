type Props = {
  page: number;
  totalPages: number;
  size: number;
  onSizeChange: (size: number) => void;
};






export default function PaginationControlsTop({
  page,
  totalPages,
  size,

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

        
      </div>
    </div>
  );
}