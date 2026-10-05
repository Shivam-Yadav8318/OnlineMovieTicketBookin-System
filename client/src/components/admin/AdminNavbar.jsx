import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const AdminNavbar = () => {
  const { adminLogout } = useAppContext()

  return (
    <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
      <Link to="/">
        <img src={assets.logo} alt="logo" className='w-36 h-auto' />
      </Link>
      <button
        onClick={adminLogout}
        className='px-4 py-1.5 text-sm border border-gray-500 rounded-full hover:border-primary hover:text-primary transition cursor-pointer'
      >
        Logout
      </button>
    </div>
  )
}

export default AdminNavbar