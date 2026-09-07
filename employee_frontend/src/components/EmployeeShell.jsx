import { NavLink, useNavigate } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', mark: '01' },
  { to: '/requisitions', label: 'Requisitions', mark: 'RQ' },
  { to: '/items', label: 'Item master', mark: 'IT' },
  { to: '/purchase-orders', label: 'Purchase orders', mark: 'PO' },
  { to: '/vendor-bids', label: 'Vendor bids', mark: 'VB' },
  { to: '/lc-items', label: 'LC register', mark: 'LC' },
]

export default function EmployeeShell({ children }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('employee_username') || 'employee'

  function logout() {
    localStorage.removeItem('employee_token')
    localStorage.removeItem('employee_username')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f3f1e9] lg:flex">
      <aside className="bg-[#18231f] text-[#d8dfd2] lg:fixed lg:inset-y-0 lg:flex lg:w-[258px] lg:flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.28em] text-[#9caf91]">Eskayef / ERP</p>
            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-white">Employee workspace</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9e875] text-xs font-extrabold text-[#18231f]">E</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-4 lg:block lg:flex-1 lg:space-y-1">
          <p className="mono hidden px-3 pb-2 text-[10px] uppercase tracking-[0.22em] text-[#778579] lg:block">Workspaces</p>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `group flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[#d9e875] text-[#18231f]' : 'text-[#aab6a7] hover:bg-white/10 hover:text-white'}`}>
              {({ isActive }) => <>
                <span className={`mono flex h-6 w-7 items-center justify-center rounded text-[9px] ${isActive ? 'bg-[#18231f]/10' : 'bg-white/10 text-[#9caf91]'}`}>{link.mark}</span>
                {link.label}
              </>}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-white/10 p-5 lg:block">
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-[#778579]">Signed in as</p>
          <p className="mt-1 truncate text-sm font-bold text-white">{username}</p>
          <button onClick={logout} className="mt-4 text-xs font-bold text-[#aab6a7] transition hover:text-[#d9e875]">Sign out <span aria-hidden="true">→</span></button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:ml-[258px]">{children}</main>
    </div>
  )
}
