import type { RequisitionRow } from "../services/requisitions";

type Props = {
  rows: RequisitionRow[];
};

function formatDate(value?: string | null) {
  if (!value) return "";
  // Back end returns ISO strings; keep it simple for ERP users.
  // If it's already YYYY-MM-DD, this keeps it readable.
  return value.replace("T", " ").slice(0, 16);
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "";
  return Number(value).toLocaleString();
}

export default function RequisitionsTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-3 font-semibold">IndentNo</th>
            <th className="px-3 py-3 font-semibold">IndentDate</th>
            <th className="px-3 py-3 font-semibold">RequestedBy</th>
            <th className="px-3 py-3 font-semibold">Itemkey</th>
            <th className="px-3 py-3 font-semibold">Desc1</th>
            <th className="px-3 py-3 font-semibold">Qtyord</th>
            <th className="px-3 py-3 font-semibold">UOM</th>
            <th className="px-3 py-3 font-semibold">Price</th>
            <th className="px-3 py-3 font-semibold">RequiredDate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={`${r.IndentNo ?? r.IndentNo1 ?? "row"}-${r.RowNum ?? idx}`}
              className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className="px-3 py-3">
                {r.IndentNo ?? r.IndentNo1 ?? ""}
              </td>
              <td className="px-3 py-3">{formatDate(r.IndentDate)}</td>
              <td className="px-3 py-3">{r.RequestedBy ?? ""}</td>
              <td className="px-3 py-3">{r.Itemkey ?? ""}</td>
              <td className="px-3 py-3">{r.Desc1 ?? ""}</td>
              <td className="px-3 py-3">{formatNumber(r.Qtyord ?? null)}</td>
              <td className="px-3 py-3">{r.UOM ?? ""}</td>
              <td className="px-3 py-3">{formatNumber(r.Price ?? null)}</td>
              <td className="px-3 py-3">{formatDate(r.RequiredDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

