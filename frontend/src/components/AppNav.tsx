export type AppTab = "requisitions" | "items";

type Props = {
  active: AppTab;
  onChange: (tab: AppTab) => void;
};

export default function AppNav({ active, onChange }: Props) {
  const tabClass = (tab: AppTab) =>
    [
      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
      active === tab
        ? "bg-slate-900 text-white"
        : "text-slate-700 hover:bg-slate-100",
    ].join(" ");

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <div className="text-lg font-semibold text-slate-900">ERP Portal</div>
          <div className="text-sm text-slate-600">
            Purchase requisitions and item master
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={tabClass("requisitions")}
            onClick={() => onChange("requisitions")}
          >
            Requisitions
          </button>
          <button
            type="button"
            className={tabClass("items")}
            onClick={() => onChange("items")}
          >
            Items
          </button>
        </div>
      </div>
    </nav>
  );
}
