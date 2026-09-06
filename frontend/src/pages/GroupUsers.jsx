import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroups, getUsers, addUserToGroup, removeUserFromGroup } from '../api/client'

export default function GroupUsers() {
    const { id } = useParams()
    const navigate = useNavigate()
    const groupId = parseInt(id)

    const [group, setGroup] = useState(null)
    const [allUsers, setAllUsers] = useState([])
    const [members, setMembers] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [tab, setTab] = useState('members')

    async function load() {
        const [groupsRes, usersRes] = await Promise.all([
            getGroups(),
            getUsers(),
        ])
        const found = groupsRes.data.find(g => g.id === groupId)
        if (!found) { navigate('/groups'); return }
        setGroup(found)
        const memberList = usersRes.data.filter(u => u.groups.includes(found.name))
        setMembers(memberList)
        setAllUsers(usersRes.data)
        setLoading(false)
    }

    useEffect(() => { load() }, [id])

    function toggleSelect(userId) {
        setSelected(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    function toggleAll(users) {
        const ids = users.map(u => u.id)
        const allSelected = ids.every(id => selected.includes(id))
        if (allSelected) {
            setSelected(prev => prev.filter(id => !ids.includes(id)))
        } else {
            setSelected(prev => [...new Set([...prev, ...ids])])
        }
    }

    async function handleAddSelected() {
        setSaving(true)
        try {
            await Promise.all(selected.map(uid => addUserToGroup(groupId, uid)))
            setSelected([])
            load()
        } finally {
            setSaving(false)
        }
    }

    async function handleRemoveSelected() {
        setSaving(true)
        try {
            await Promise.all(selected.map(uid => removeUserFromGroup(groupId, uid)))
            setSelected([])
            load()
        } finally {
            setSaving(false)
        }
    }

    const nonMembers = allUsers.filter(u => !u.groups.includes(group?.name))

    if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

    const currentList = tab === 'members' ? members : nonMembers

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
                <button onClick={() => navigate('/groups')} className="text-slate-400 hover:text-slate-600 text-sm">Groups</button>
                <span className="text-slate-300">/</span>
                <button onClick={() => navigate(`/groups/${id}`)} className="text-slate-400 hover:text-slate-600 text-sm">{group.name}</button>
                <span className="text-slate-300">/</span>
                <span className="text-sm text-slate-600">Members</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-6">Manage Members</h1>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-slate-200">
                <button
                    onClick={() => { setTab('members'); setSelected([]) }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'members' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Current members ({members.length})
                </button>
                <button
                    onClick={() => { setTab('add'); setSelected([]) }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'add' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Add members ({nonMembers.length})
                </button>
            </div>

            {/* Action bar */}
            {selected.length > 0 && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-3">
                    <p className="text-sm text-blue-700">{selected.length} selected</p>
                    {tab === 'members'
                        ? <button onClick={handleRemoveSelected} disabled={saving} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">
                            Remove from group
                          </button>
                        : <button onClick={handleAddSelected} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                            Add to group
                          </button>
                    }
                </div>
            )}

            {/* User list */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {currentList.length === 0 ? (
                    <p className="px-4 py-8 text-sm text-center text-slate-400">
                        {tab === 'members' ? 'No members yet.' : 'All users are already in this group.'}
                    </p>
                ) : (
                    <>
                        {/* Select all */}
                        <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-slate-50">
                            <input
                                type="checkbox"
                                checked={currentList.every(u => selected.includes(u.id))}
                                onChange={() => toggleAll(currentList)}
                                className="rounded mr-3"
                            />
                            <span className="text-xs text-slate-500 font-medium">Select all</span>
                        </div>
                        {currentList.map(user => (
                            <div key={user.id} className="flex items-center px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(user.id)}
                                    onChange={() => toggleSelect(user.id)}
                                    className="rounded mr-3"
                                />
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{user.username}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                                <span className={`ml-auto text-xs px-2 py-0.5 rounded font-medium ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}