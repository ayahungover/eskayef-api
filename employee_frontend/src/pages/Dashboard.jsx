import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageFrame from '../components/PageFrame'
import { getItems, getLcItems, getRequisitions, getVendorBids } from '../api/client'
import { ErrorState, LoadingState } from '../components/StateMessage'

const cards = [
  { to: '/requisitions', code: 'RQ', title: 'Requisitions', copy: 'Browse purchase requests and their current line-level status.', accent: 'bg-[#e4ecd0]' },
  { to: '/items', code: 'IT', title: 'Item master', copy: 'Find item codes, descriptions, and purchase units.', accent: 'bg-[#dce9e5]' },
  { to: '/purchase-orders', code: 'PO', title: 'Purchase orders', copy: 'Look up a PO header and its vendor context.', accent: 'bg-[#f0dfc4]' },
  { to: '/vendor-bids', code: 'VB', title: 'Vendor bids', copy: 'Review tender pricing, lead times, and submissions.', accent: 'bg-[#e4d8e8]' },
  { to: '/lc-items', code: 'LC', title: 'LC register', copy: 'Explore imported items by category and date range.', accent: 'bg-[#d8e5ef]' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.allSettled([
      getRequisitions({ page: 1, size: 1 }),
      getItems({ page: 1, size: 1 }),
      getVendorBids({ page: 1, size: 1, tender_no: '00000' }),
      getLcItems({ page: 1, size: 1, catcode: 'ALL', date_from: '2020-01-01' }),
    ]).then((results) => {
      if (!active) return
      setStats({
        requisitions: results[0].status === 'fulfilled' ? results[0].value.data.total_records : null,
        items: results[1].status === 'fulfilled' ? results[1].value.data.total_records : null,
        bids: results[2].status === 'fulfilled' ? results[2].value.data.total_records : null,
        lc: results[3].status === 'fulfilled' ? results[3].value.data.total_records : null,
      })
    }).catch(() => setError('The overview could not load live totals.'))
    return () => { active = false }
  }, [])

  const metricItems = [
    ['Requisition lines', stats?.requisitions, '/requisitions'],
    ['Catalog items', stats?.items, '/items'],
    ['Vendor bid lines', stats?.bids, '/vendor-bids'],
    ['LC item records', stats?.lc, '/lc-items'],
  ]

  return <PageFrame eyebrow="Employee portal / overview" title="Good morning." description="A live index of the operational data you can access." action={<span className="mono rounded-full bg-[#e4ecd0] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#566c2b]">Live API view</span>}>
    {error ? <ErrorState error={error} onRetry={() => window.location.reload()} /> : <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map(([label, value, to], index) => <Link key={label} to={to} className={`animate-rise rounded-lg border border-[#d9d8ce] bg-white p-5 transition hover:-translate-y-1 hover:border-[#a5b83d] ${index > 1 ? 'animate-rise-delay' : ''}`}><div className="flex items-start justify-between"><p className="mono text-[10px] uppercase tracking-[0.16em] text-[#7c897d]">{label}</p><span className="text-[#91a52d]">↗</span></div><p className="mt-8 text-3xl font-extrabold tracking-[-0.07em] text-[#26332e]">{value === null || value === undefined ? '—' : value.toLocaleString()}</p><p className="mt-1 text-xs text-[#8b968c]">Open visualizer</p></Link>)}
      </section>
      <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_0.34fr]">
        <div><div className="mb-4 flex items-end justify-between"><div><p className="mono text-[10px] uppercase tracking-[0.2em] text-[#71806f]">Your tools</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.05em]">Operational views</h2></div><span className="text-xs text-[#8b968c]">5 endpoint visualizers</span></div><div className="grid gap-3 sm:grid-cols-2">{cards.map((card, index) => <Link key={card.to} to={card.to} className={`group flex min-h-36 flex-col justify-between rounded-lg border border-[#d9d8ce] p-5 transition hover:-translate-y-1 hover:border-[#a5b83d] ${card.accent} ${index === 4 ? 'sm:col-span-2' : ''}`}><div className="flex items-start justify-between"><span className="mono rounded bg-white/60 px-2 py-1 text-[10px] font-medium text-[#56655b]">{card.code}</span><span className="text-lg transition group-hover:translate-x-1">→</span></div><div><h3 className="text-base font-extrabold tracking-[-0.03em]">{card.title}</h3><p className="mt-1 max-w-md text-xs leading-5 text-[#66766b]">{card.copy}</p></div></Link>)}</div></div>
        <aside className="rounded-lg bg-[#26332e] p-6 text-[#d8dfd2]"><p className="mono text-[10px] uppercase tracking-[0.2em] text-[#a7b99b]">Quick note</p><h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-[-0.06em] text-white">Your access follows your role.</h2><p className="mt-4 text-sm leading-6 text-[#aab6a7]">Every view is backed by the same permissions that protect the API. If a page is unavailable, ask your administrator to update your group access.</p><div className="mt-8 h-px bg-white/10" /><p className="mt-4 mono text-[10px] uppercase tracking-[0.15em] text-[#778579]">System status / connected</p></aside>
      </section>
    </>}
  </PageFrame>
}
