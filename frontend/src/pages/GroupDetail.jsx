import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroups, getUsers, getGroupPermissions } from '../api/client'

export default function GroupDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const groupId = parseInt(id)

    const [group, setGroup] = useState(null)
    const [memberCount, setMemberCount] = useState(0)
    const [permCount, setPermCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [groupsRes, usersRes, permsRes] = await Promise.all([
                getGroups(),
                getUsers(),
                getGroupPermissions(groupId),
            ])
            const found = groupsRes.data.find(g => g.id === groupId)
            if (!found) { navigate('/groups'); return }
            setGroup(found)
            setMemberCount(usersRes.data.filter(u => u.groups.includes(found.name)).length)
            setPermCount(permsRes.data.length)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
                <button onClick={() => navigate('/groups')} className="text-slate-400 hover:text-slate-600 text-sm">Groups</button>
                <span className="text-slate-300">/</span>
                <span className="text-sm text-slate-600">{group.name}</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">{group.name}</h1>
            {group.description && <p className="text-sm text-slate-500 mb-6">{group.description}</p>}

            <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                    onClick={() => navigate(`/groups/${id}/users`)}
                    className="bg-white border border-slate-200 rounded-lg p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all"
                >
                    <p className="text-2xl font-semibold text-slate-900">{memberCount}</p>
                    <p className="text-sm text-slate-600 mt-1">Members</p>
                    <p className="text-xs text-blue-500 mt-3">Manage members →</p>
                </button>
                <button
                    onClick={() => navigate(`/groups/${id}/permissions`)}
                    className="bg-white border border-slate-200 rounded-lg p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all"
                >
                    <p className="text-2xl font-semibold text-slate-900">{permCount}</p>
                    <p className="text-sm text-slate-600 mt-1">Endpoint permissions</p>
                    <p className="text-xs text-blue-500 mt-3">Manage permissions →</p>
                </button>
            </div>
        </div>
    )
}