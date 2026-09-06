import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Users from './pages/Users'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import GroupUsers from './pages/GroupUsers'
import GroupPermissions from './pages/GroupPermissions'
import Sidebar from './components/Sidebar'

function PrivateLayout({ children }) {
    const token = localStorage.getItem('token')
    if (!token) return <Navigate to="/login" replace />
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/users" element={<PrivateLayout><Users /></PrivateLayout>} />
                <Route path="/groups" element={<PrivateLayout><Groups /></PrivateLayout>} />
                <Route path="/groups/:id" element={<PrivateLayout><GroupDetail /></PrivateLayout>} />
                <Route path="/groups/:id/users" element={<PrivateLayout><GroupUsers /></PrivateLayout>} />
                <Route path="/groups/:id/permissions" element={<PrivateLayout><GroupPermissions /></PrivateLayout>} />
                <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
        </BrowserRouter>
    )
}