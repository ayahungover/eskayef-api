import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../api/client'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editUser, setEditUser] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteError, setDeleteError] = useState('')
    const [form, setForm] = useState({ username: '', email: '', password: '', is_active: true })
    const [error, setError] = useState('')

    async function load() {
        try {
            const res = await getUsers()
            setUsers(res.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setForm({ username: '', email: '', password: '', is_active: true })
        setError('')
        setShowCreate(true)
    }

    function openEdit(user) {
        setForm({ email: user.email, password: '', is_active: user.is_active })
        setError('')
        setEditUser(user)
    }

    async function handleCreate(e) {
        e.preventDefault()
        setError('')
        try {
            await createUser(form)
            setShowCreate(false)
            load()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create user')
        }
    }

    async function handleEdit(e) {
        e.preventDefault()
        setError('')
        const payload = { email: form.email, is_active: form.is_active }
        if (form.password) payload.password = form.password
        try {
            await updateUser(editUser.id, payload)
            setEditUser(null)
            load()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update user')
        }
    }

    async function handleDelete() {
        setDeleteError('')
        try {
            await deleteUser(deleteTarget.id)
            setDeleteTarget(null)
            load()
        } catch (err) {
            setDeleteError(err.response?.data?.detail || 'Failed to delete user')
        }
    }

    if (loading) return <p className="text-slate-500 text-sm">Loading...</p>

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Users</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{users.length} total</p>
                </div>
                <button onClick={openCreate} className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors">
                    Add user
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Username</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Groups</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users yet. Add one to get started.</td></tr>
                        )}
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{user.username}</td>
                                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                <td className="px-4 py-3">
                                    {user.groups.length === 0
                                        ? <span className="text-slate-400">No groups</span>
                                        : user.groups.map(g => (
                                            <span key={g} className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded mr-1">{g}</span>
                                        ))
                                    }
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${user.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button onClick={() => openEdit(user)} className="text-slate-400 hover:text-blue-500 text-sm">Edit</button>
                                    <button onClick={() => { setDeleteError(''); setDeleteTarget(user) }} className="text-slate-400 hover:text-red-500 text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreate && (
                <Modal title="Add user" onClose={() => setShowCreate(false)}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded" />
                            <label htmlFor="active" className="text-sm text-slate-700">Active</label>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Create</button>
                        </div>
                    </form>
                </Modal>
            )}

            {editUser && (
                <Modal title={`Edit ${editUser.username}`} onClose={() => setEditUser(null)}>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
                            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="edit-active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded" />
                            <label htmlFor="edit-active" className="text-sm text-slate-700">Active</label>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Save</button>
                        </div>
                    </form>
                </Modal>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Delete user "${deleteTarget.username}"? This cannot be undone.`}
                    error={deleteError}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}