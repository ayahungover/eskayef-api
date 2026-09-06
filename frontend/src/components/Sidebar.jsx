import { NavLink, useNavigate } from 'react-router-dom'

const links = [
    { to: '/users', label: 'Users' },
    { to: '/groups', label: 'Groups' },
]

export default function Sidebar() {
    const navigate = useNavigate()

    function logout() {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <aside className="w-56 bg-slate-900 flex flex-col h-screen shrink-0">
            <div className="px-6 py-5 border-b border-slate-700">
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Eskayef</p>
                <p className="text-white font-semibold mt-0.5">Admin Portal</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="px-3 py-4 border-t border-slate-700">
                <div className="px-3 py-2 mb-2">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm text-slate-300 font-medium">superadmin</p>
                </div>
                <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    Sign out
                </button>
            </div>
        </aside>
    )
}