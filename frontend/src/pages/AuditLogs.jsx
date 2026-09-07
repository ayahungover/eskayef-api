import { useEffect, useState } from 'react'
import { getAuditLogs } from '../api/client'

const PAGE_SIZE = 50

function formatTimestamp(value) {
    if (!value) return '—'
    return new Date(value).toLocaleString()
}

export default function AuditLogs() {
    const [logs, setLogs] = useState(null)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({ username: '', method: '' })
    const [submittedFilters, setSubmittedFilters] = useState(filters)
    const [error, setError] = useState('')

    async function load(nextPage = page, nextFilters = submittedFilters) {
        setError('')
        try {
            const response = await getAuditLogs({
                page: nextPage,
                size: PAGE_SIZE,
                ...(nextFilters.username ? { username: nextFilters.username } : {}),
                ...(nextFilters.method ? { method: nextFilters.method } : {}),
            })
            setLogs(response.data)
        } catch (requestError) {
            setError(requestError.response?.data?.detail || 'Failed to load audit logs')
        }
    }

    useEffect(() => { load() }, [page, submittedFilters])

    function search(event) {
        event.preventDefault()
        setPage(1)
        setSubmittedFilters({ ...filters })
    }

    function clearFilters() {
        const emptyFilters = { username: '', method: '' }
        setFilters(emptyFilters)
        setPage(1)
        setSubmittedFilters(emptyFilters)
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Audit logs</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Review API access activity recorded by the system.</p>
                </div>
                <button onClick={() => load()} className="self-start px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-100 transition-colors sm:self-auto">
                    Refresh
                </button>
            </div>

            <form onSubmit={search} className="bg-white border border-slate-200 rounded-lg p-4 mb-4 flex flex-col gap-3 sm:flex-row">
                <input
                    value={filters.username}
                    onChange={event => setFilters({ ...filters, username: event.target.value })}
                    placeholder="Filter by username"
                    className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={filters.method}
                    onChange={event => setFilters({ ...filters, method: event.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors">Filter</button>
                <button type="button" onClick={clearFilters} className="px-4 py-2 text-slate-600 text-sm hover:text-slate-900">Clear</button>
            </form>

            {error && <p className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">{error}</p>}
            {logs === null && !error && <p className="text-slate-500 text-sm">Loading audit logs...</p>}
            {logs && (
                <>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Time</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Username</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Method</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Endpoint</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">IP address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No audit activity found.</td></tr>}
                                {logs.data.map(log => (
                                    <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatTimestamp(log.timestamp)}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{log.username}</td>
                                        <td className="px-4 py-3"><span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">{log.method}</span></td>
                                        <td className="px-4 py-3 text-slate-600">{log.endpoint}</td>
                                        <td className="px-4 py-3 text-slate-500">{log.ip_address}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
                        <span>{logs.total_records.toLocaleString()} total records</span>
                        <div className="flex items-center gap-3">
                            <span>Page {logs.page} of {logs.total_pages || 1}</span>
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-100">Previous</button>
                            <button disabled={!logs.total_pages || page >= logs.total_pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border border-slate-300 rounded disabled:opacity-40 hover:bg-slate-100">Next</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
