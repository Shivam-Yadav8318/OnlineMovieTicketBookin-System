import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import BlurCircle from '../../components/BlurCircle'

const AdminLogin = () => {
  const { adminLogin } = useAppContext()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return

    setLoading(true)
    await adminLogin(username, password)
    setLoading(false)
  }

  return (
    <div className='relative flex items-center justify-center min-h-screen px-6 overflow-hidden'>
      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle bottom='-100px' right='-100px' />

      <form
        onSubmit={handleSubmit}
        className='relative z-10 w-full max-w-sm bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col gap-5'
      >
        <div className='text-center'>
          <h1 className='text-2xl font-semibold'>Admin Login</h1>
          <p className='text-sm text-gray-400 mt-1'>Sign in to manage movies, shows and bookings.</p>
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='admin-username' className='text-sm text-gray-300'>Username</label>
          <input
            id='admin-username'
            type='text'
            autoComplete='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='px-4 py-2 rounded-md bg-black/40 border border-gray-600 outline-none focus:border-primary transition text-sm'
            placeholder='admin'
            required
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='admin-password' className='text-sm text-gray-300'>Password</label>
          <input
            id='admin-password'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='px-4 py-2 rounded-md bg-black/40 border border-gray-600 outline-none focus:border-primary transition text-sm'
            placeholder='••••••••'
            required
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='mt-2 px-6 py-2.5 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin
