import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { useAuth, useUser, useClerk } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const ADMIN_TOKEN_STORAGE_KEY = 'quickshow_admin_token'

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'

  const { user, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()

  // --- Regular (Clerk) user state ---
  const [shows, setShows] = useState([])
  const [loadingShows, setLoadingShows] = useState(true)
  const [favoriteMovies, setFavoriteMovies] = useState([])

  // --- Standalone admin auth state (separate from Clerk) ---
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || null
    } catch (error) {
      return null
    }
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken

  const adminTokenRef = useRef(adminToken)
  adminTokenRef.current = adminToken

  // Every request made with the shared axios instance automatically gets
  // the current Clerk session token attached (when signed in), plus the
  // admin token when one is stored (for /api/admin/* and /api/show/add).
  // These are two separate headers, so they never conflict with each other.
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use(async (config) => {
      try {
        const token = await getTokenRef.current()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        // Not signed in / token unavailable — request continues without auth.
      }

      if (adminTokenRef.current) {
        config.headers['x-admin-token'] = adminTokenRef.current
      }

      return config
    })

    return () => axios.interceptors.request.eject(interceptorId)
  }, [])

  const adminLogin = async (username, password) => {
    try {
      const { data } = await axios.post('/api/admin/login', { username, password })
      if (data.success) {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token)
        setAdminToken(data.token)
        setIsAdmin(true)
        toast.success('Logged in')
        navigate('/admin')
        return true
      }
      toast.error(data.message || 'Login failed')
      return false
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid username or password')
      return false
    }
  }

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
    setAdminToken(null)
    setIsAdmin(false)
    toast.success('Logged out')
    navigate('/')
  }

  // Confirms a stored admin token is still valid (e.g. after a page
  // refresh). If it's expired/invalid, the token is cleared so the login
  // form shows again.
  const verifyAdmin = useCallback(async () => {
    if (!adminToken) {
      setIsAdmin(false)
      setCheckingAdmin(false)
      return
    }
    try {
      const { data } = await axios.get('/api/admin/is-admin')
      setIsAdmin(!!data.isAdmin)
      if (!data.isAdmin) {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
        setAdminToken(null)
      }
    } catch (error) {
      setIsAdmin(false)
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
      setAdminToken(null)
    } finally {
      setCheckingAdmin(false)
    }
  }, [adminToken])

  const fetchShows = useCallback(async () => {
    try {
      setLoadingShows(true)
      const { data } = await axios.get('/api/show/all')
      if (data.success) {
        setShows(data.shows)
      }
    } catch (error) {
      console.log('FETCH SHOWS ERROR:', error)
    } finally {
      setLoadingShows(false)
    }
  }, [])

  const fetchFavoriteMovies = useCallback(async () => {
    if (!isSignedIn) {
      setFavoriteMovies([])
      return
    }
    try {
      const { data } = await axios.get('/api/user/favorites')
      if (data.success) {
        setFavoriteMovies(data.movies)
      }
    } catch (error) {
      console.log('FETCH FAVORITES ERROR:', error)
    }
  }, [isSignedIn])

  const toggleFavorite = async (movieId) => {
    if (!isSignedIn) {
      openSignIn()
      return
    }
    try {
      const { data } = await axios.post('/api/user/update-favorite', { movieId })
      if (data.success) {
        toast.success(data.message)
        await fetchFavoriteMovies()
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Session expired / token not accepted — prompt sign-in again
        // instead of showing a raw "not authorized" message.
        openSignIn()
        return
      }
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  useEffect(() => {
    fetchShows()
  }, [fetchShows])

  useEffect(() => {
    fetchFavoriteMovies()
  }, [fetchFavoriteMovies])

  useEffect(() => {
    verifyAdmin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken])

  const value = {
    axios,
    currency,
    user,
    isSignedIn,
    navigate,
    isAdmin,
    checkingAdmin,
    adminLogin,
    adminLogout,
    shows,
    loadingShows,
    fetchShows,
    favoriteMovies,
    fetchFavoriteMovies,
    toggleFavorite,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
