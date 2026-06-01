import type { ItemRow } from "../services/items";

type Props = {
  rows: ItemRow[];
};

export default function ItemsTable({ rows }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-[700px] w-full border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-3 font-semibold">Itemkey</th>
            <th className="px-3 py-3 font-semibold">Desc1</th>
            <th className="px-3 py-3 font-semibold">Purchase UOM</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.itemkey}
              className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
            >
              <td className="px-3 py-3 font-medium text-slate-900">
                {row.itemkey}
              </td>
              <td className="px-3 py-3">{row.desc1 ?? ""}</td>
              <td className="px-3 py-3">{row.purchase_uom_code ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
