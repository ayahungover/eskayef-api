import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await login(username.trim(), password)
      localStorage.setItem('employee_token', response.data.access_token)
      localStorage.setItem('employee_username', username.trim())
      navigate(location.state?.from || '/', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'We could not verify those credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f1e9] px-5 py-12 sm:px-10">
      <section className="w-full max-w-md animate-rise">
        <div className="rounded-lg border border-[#d8d8cf] bg-white p-7 shadow-sm sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#26332e]">Eskayef API</h1>
          <p className="mt-2 text-base text-[#718078]">Sign in to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#56655b]">Username</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required className="w-full rounded-md border border-[#cdd0c5] bg-white px-4 py-3 text-base outline-none transition placeholder:text-[#a4aca0] focus:border-[#7e9128] focus:ring-4 focus:ring-[#d9e875]/30" placeholder="Your username" /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold text-[#56655b]">Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="w-full rounded-md border border-[#cdd0c5] bg-white px-4 py-3 text-base outline-none transition placeholder:text-[#a4aca0] focus:border-[#7e9128] focus:ring-4 focus:ring-[#d9e875]/30" placeholder="Your password" /></label>
            {error && <p className="rounded-md border border-[#e5c5bd] bg-[#fff2ee] px-3 py-2 text-sm font-semibold text-[#9c4b3f]">{error}</p>}
            <button disabled={loading} className="w-full rounded-md bg-[#26332e] px-4 py-3.5 text-base font-extrabold text-white transition hover:bg-[#35463d] disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in...' : 'Log in'}</button>
          </form>
        </div>
      </section>
    </main>
  )
}
