import { useCallback, useEffect, useMemo, useState } from 'react'
import PageFrame from '../components/PageFrame'
import { ErrorState, LoadingState } from '../components/StateMessage'
import { getItems, getLcItems, getPurchaseOrder, getRequisitions, getVendorBids } from '../api/client'

const configs = {
  requisitions: { eyebrow: 'BME / requisitions', title: 'Requisition lines', description: 'Search and scan purchase requisition lines from the ERP.', endpoint: 'GET /requisitions', columns: ['IndentNo', 'IndentDate', 'RequestedBy', 'ItemNo', 'Description', 'Qtyord'], filters: 'requisition' },
  items: { eyebrow: 'BME / warehouse', title: 'Item master', description: 'Find the item code and purchasing unit you need.', endpoint: 'GET /items', columns: ['itemkey', 'desc1', 'purchase_uom_code'], filters: 'items' },
  'vendor-bids': { eyebrow: 'Commercial / e-tender', title: 'Vendor bids', description: 'Compare bid submissions, prices, quantities, and lead times.', endpoint: 'GET /vendor-bids', columns: ['tender_no', 'item_name', 'email', 'qty', 'unit_price', 'lead_time', 'remarks'], filters: 'bids' },
  'lc-items': { eyebrow: 'Commercial / imports', title: 'LC item register', description: 'Review imported item records by category and opening date.', endpoint: 'GET /commercial/lc-items', columns: ['catcode', 'lc_no', 'tradename', 'qty', 'unit_price', 'currency', 'supplier', 'lc_open_date'], filters: 'lc' },
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString()
  const text = String(value)
  return text.length > 48 ? `${text.slice(0, 48)}...` : text
}

function useEndpoint(type, filters) {
  const [state, setState] = useState({ loading: true, error: '', data: null })
  const query = useMemo(() => ({ page: filters.page, size: 20, ...(filters.search ? { itemkey: filters.search, desc1: filters.search } : {}), ...(type === 'requisitions' ? { indent_no: filters.search || undefined, sort_by: 'IndentDate', sort_order: 'desc' } : {}), ...(type === 'vendor-bids' ? { tender_no: filters.tenderNo, price_filter: filters.priceFilter, sort_by: 'login', sort_order: 'asc' } : {}), ...(type === 'lc-items' ? { catcode: filters.catcode, date_from: filters.dateFrom, ...(filters.dateTo ? { date_to: filters.dateTo } : {}), sort_by: 'lc_open_date', sort_order: 'desc' } : {}) }), [filters, type])
  const load = useCallback(() => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    const requests = { requisitions: getRequisitions, items: getItems, 'vendor-bids': getVendorBids, 'lc-items': getLcItems, 'purchase-orders': () => Promise.resolve({ data: null }) }
    requests[type](query).then((response) => setState({ loading: false, error: '', data: response.data })).catch((error) => {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) ? detail.map((item) => item.msg).join(', ') : detail || error.response?.data?.message
      setState({ loading: false, error: message || 'The API did not return this view.', data: null })
    })
  }, [query, type])
  useEffect(load, [load])
  return { ...state, reload: load }
}

function Filters({ type, filters, setFilters, onSearch }) {
  if (type === 'purchase-orders') return <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row"><input value={filters.pono} onChange={(event) => setFilters({ ...filters, pono: event.target.value })} placeholder="Enter PO number" className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7e9128]" /><button className="rounded-md bg-[#26332e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#35463d]">Lookup PO</button></form>
  if (type === 'vendor-bids') return <form onSubmit={onSearch} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><input value={filters.tenderNo} onChange={(event) => setFilters({ ...filters, tenderNo: event.target.value })} placeholder="5-digit tender no." required className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7e9128]" /><select value={filters.priceFilter} onChange={(event) => setFilters({ ...filters, priceFilter: event.target.value })} className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none"><option value="all">All prices</option><option value="with">With price</option><option value="without">Without price</option></select><button className="rounded-md bg-[#26332e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#35463d]">Search</button></form>
  if (type === 'lc-items') return <form onSubmit={onSearch} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"><select value={filters.catcode} onChange={(event) => setFilters({ ...filters, catcode: event.target.value })} className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none"><option>ALL</option><option>PRM</option><option>PPM</option><option>PCM</option><option>LGS</option><option>LPS</option></select><input type="date" value={filters.dateFrom} onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value })} className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none" /><input type="date" value={filters.dateTo} onChange={(event) => setFilters({ ...filters, dateTo: event.target.value })} className="rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none" /><button className="rounded-md bg-[#26332e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#35463d]">Filter</button></form>
  return <form onSubmit={onSearch} className="flex gap-2"><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder={type === 'requisitions' ? 'Search indent number' : 'Search item code or description'} className="min-w-0 flex-1 rounded-md border border-[#cdd0c5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7e9128]" /><button className="rounded-md bg-[#26332e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#35463d]">Search</button></form>
}

export default function DataExplorer({ type }) {
  const config = configs[type]
  const [filters, setFilters] = useState({ page: 1, search: '', pono: '', tenderNo: '', priceFilter: 'all', catcode: 'ALL', dateFrom: '2020-01-01', dateTo: '' })
  const [submitted, setSubmitted] = useState(filters)
  const { loading, error, data, reload } = useEndpoint(type, submitted)
  const [poResult, setPoResult] = useState(null)
  const [poError, setPoError] = useState('')
  const [poLoading, setPoLoading] = useState(false)

  function search(event) { event.preventDefault(); setSubmitted({ ...filters, page: 1 }) }
  function changePage(page) { setSubmitted({ ...submitted, page }) }

  async function lookupPo(event) {
    event.preventDefault(); setPoLoading(true); setPoError(''); setPoResult(null)
    try { const response = await getPurchaseOrder(filters.pono); setPoResult(response.data) } catch (requestError) { setPoError(requestError.response?.data?.message || 'Purchase order was not found.') } finally { setPoLoading(false) }
  }

  if (type === 'purchase-orders') return <PageFrame eyebrow="BME / purchasing" title="Purchase orders" description="Look up a purchase order header by its number." action={<span className="mono rounded-full bg-[#f0dfc4] px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[#8a6332]">GET /bme/purchase-order</span>}><div className="max-w-xl rounded-lg border border-[#d9d8ce] bg-white p-5"><Filters type={type} filters={filters} setFilters={setFilters} onSearch={lookupPo} />{poLoading && <LoadingState />}{poError && <p className="mt-5 rounded-md bg-[#fff2ee] px-3 py-2 text-xs font-semibold text-[#9c4b3f]">{poError}</p>}{poResult?.data && <div className="mt-6 space-y-3">{poResult.data.map((row, index) => <div key={index} className="grid gap-3 border-t border-[#e8e7df] pt-4 sm:grid-cols-2">{Object.entries(row).map(([key, value]) => <div key={key}><p className="mono text-[9px] uppercase tracking-[0.12em] text-[#8b968c]">{key}</p><p className="mt-1 text-sm font-bold text-[#35463d]">{formatValue(value)}</p></div>)}</div>)}</div>}</div></PageFrame>

  return <PageFrame eyebrow={config.eyebrow} title={config.title} description={config.description} action={<span className="mono rounded-full bg-white px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-[#71806f]">{config.endpoint}</span>}><div className="rounded-lg border border-[#d9d8ce] bg-white p-4 sm:p-5"><div className="mb-6"><Filters type={type} filters={filters} setFilters={setFilters} onSearch={search} /></div>{loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={reload} /> : <><div className="mb-4 flex items-center justify-between text-xs text-[#8b968c]"><span><strong className="text-[#35463d]">{data?.total_records?.toLocaleString() || 0}</strong> records found</span><span className="mono">Page {data?.page || 1} / {data?.total_pages || 1}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="border-y border-[#e8e7df]">{config.columns.map((column) => <th key={column} className="whitespace-nowrap px-3 py-3 mono text-[9px] uppercase tracking-[0.12em] text-[#7c897d]">{column}</th>)}</tr></thead><tbody>{(data?.data || []).map((row, index) => <tr key={index} className="border-b border-[#efeee8] transition hover:bg-[#f7f8f1]">{config.columns.map((column) => <td key={column} className="max-w-[230px] truncate px-3 py-3 text-xs font-semibold text-[#536158]">{formatValue(row[column])}</td>)}</tr>)}</tbody></table>{!data?.data?.length && <p className="py-12 text-center text-sm text-[#8b968c]">No records matched this view.</p>}</div><div className="mt-5 flex items-center justify-between"><p className="text-xs text-[#8b968c]">Showing up to 20 records</p><div className="flex gap-2"><button disabled={!data?.page || data.page <= 1} onClick={() => changePage(data.page - 1)} className="rounded border border-[#d4d6cb] px-3 py-2 text-xs font-bold disabled:opacity-40">Previous</button><button disabled={!data?.total_pages || data.page >= data.total_pages} onClick={() => changePage(data.page + 1)} className="rounded border border-[#d4d6cb] px-3 py-2 text-xs font-bold disabled:opacity-40">Next</button></div></div></>}</div></PageFrame>
}
