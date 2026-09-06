import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGroups, createGroup, deleteGroup } from '../api/client'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Groups() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [form, setForm] = useState({ name: '', description: '' })
    const [error, setError] = useState('')
    const navigate = useNavigate()

    async function load() {
        try {
            const res = await getGroups()
            setGroups(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    async function handleCreate(e) {
        e.preventDefault()
        setError('')
        try {
            await createGroup(form)
            setShowCreate(false)
            setForm({ name: '', description: '' })
            load()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create group')
        }
    }

    async function handleDelete() {
        await deleteGroup(deleteTarget.id)
        setDeleteTarget(null)
        load()
    }

    if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Groups</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{groups.length} total</p>
                </div>
                <button onClick={() => { setShowCreate(true); setError('') }} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors">
                    Add group
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Description</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No groups yet. Add one to get started.</td></tr>
                        )}
                        {groups.map(group => (
                            <tr key={group.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/groups/${group.id}`)}>
                                <td className="px-4 py-3 font-medium text-slate-800">{group.name}</td>
                                <td className="px-4 py-3 text-slate-500">{group.description || '—'}</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(group) }} className="text-slate-400 hover:text-red-500 text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreate && (
                <Modal title="Add group" onClose={() => setShowCreate(false)}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Create</button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Delete group "${deleteTarget.name}"? All permissions assigned to this group will also be removed.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}