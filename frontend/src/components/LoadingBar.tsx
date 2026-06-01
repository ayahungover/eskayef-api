type Props = {
  label?: string;
};

export default function LoadingBar({ label = "Loading…" }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-500">Please wait</div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded bg-slate-100">
        <div className="h-full w-1/3 animate-pulse rounded bg-slate-400" />
      </div>
    </div>
  );
}

