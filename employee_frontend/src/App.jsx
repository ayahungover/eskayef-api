import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import EmployeeShell from './components/EmployeeShell'
import Dashboard from './pages/Dashboard'
import DataExplorer from './pages/DataExplorer'
import Login from './pages/Login'

function ProtectedLayout() {
  const location = useLocation()
  if (!localStorage.getItem('employee_token')) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <EmployeeShell><Outlet /></EmployeeShell>
}

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/requisitions" element={<DataExplorer type="requisitions" />} />
      <Route path="/items" element={<DataExplorer type="items" />} />
      <Route path="/purchase-orders" element={<DataExplorer type="purchase-orders" />} />
      <Route path="/vendor-bids" element={<DataExplorer type="vendor-bids" />} />
      <Route path="/lc-items" element={<DataExplorer type="lc-items" />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>
}
