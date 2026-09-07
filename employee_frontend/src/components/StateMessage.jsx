export function LoadingState() {
  return <div className="flex min-h-48 items-center justify-center text-sm text-[#718078]"><span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[#a5b83d]" />Loading live data...</div>
}

export function ErrorState({ error, onRetry }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-5 text-center"><p className="text-sm font-bold text-[#9c4b3f]">{error}</p><button onClick={onRetry} className="rounded-md border border-[#c6c9bb] px-4 py-2 text-xs font-bold text-[#4f5e53] hover:bg-[#eef0e4]">Try again</button></div>
}
