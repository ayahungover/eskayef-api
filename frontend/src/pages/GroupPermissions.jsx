import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroups, getGroupPermissions, getEndpoints, addPermission, deletePermission } from '../api/client'

export default function GroupPermissions() {
    const { id } = useParams()
    const navigate = useNavigate()
    const groupId = parseInt(id)

    const [group, setGroup] = useState(null)
    const [permissions, setPermissions] = useState([])
    const [endpoints, setEndpoints] = useState([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(null)

    async function load() {
        const [groupsRes, permsRes, endpointsRes] = await Promise.all([
            getGroups(),
            getGroupPermissions(groupId),
            getEndpoints(),
        ])
        const found = groupsRes.data.find(g => g.id === groupId)
        if (!found) { navigate('/groups'); return }
        setGroup(found)
        setPermissions(permsRes.data)
        setEndpoints(endpointsRes.data.data)
        setLoading(false)
    }

    useEffect(() => { load() }, [id])

    async function toggle(endpoint, method) {
        const key = `${method}:${endpoint}`
        setToggling(key)
        try {
            const existing = permissions.find(p => p.endpoint === endpoint && p.method === method)
            if (existing) {
                await deletePermission(existing.id)
            } else {
                await addPermission(groupId, { endpoint, method })
            }
            load()
        } finally {
            setToggling(null)
        }
    }

    if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
                <button onClick={() => navigate('/groups')} className="text-slate-400 hover:text-slate-600 text-sm">Groups</button>
                <span className="text-slate-300">/</span>
                <button onClick={() => navigate(`/groups/${id}`)} className="text-slate-400 hover:text-slate-600 text-sm">{group.name}</button>
                <span className="text-slate-300">/</span>
                <span className="text-sm text-slate-600">Permissions</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">Endpoint Access</h1>
            <p className="text-sm text-slate-500 mb-6">Toggle which endpoints members of this group can access.</p>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {endpoints.length === 0
                    ? <p className="px-4 py-8 text-sm text-center text-slate-400">No endpoints available.</p>
                    : endpoints.map(ep => {
                        const key = `${ep.method}:${ep.endpoint}`
                        const hasAccess = permissions.some(p => p.endpoint === ep.endpoint && p.method === ep.method)
                        const isToggling = toggling === key
                        return (
                            <div key={key} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-semibold text-slate-400">{ep.method}</span>
                                        <p className="text-sm font-medium text-slate-800">{ep.endpoint}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{ep.description}</p>
                                </div>
                                <button
                                    onClick={() => toggle(ep.endpoint, ep.method)}
                                    disabled={isToggling}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${hasAccess ? 'bg-blue-500' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${hasAccess ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}