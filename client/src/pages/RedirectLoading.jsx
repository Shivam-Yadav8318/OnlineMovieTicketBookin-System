import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from '../components/Loading'

// Stripe redirects here after a successful checkout (success_url =
// `${origin}/loading/my-bookings`). We give the webhook a couple of seconds
// to mark the booking as paid in the database before sending the user on to
// the page that reads that data.
const RedirectLoading = () => {
  const { nextUrl } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/${nextUrl || 'my-bookings'}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [nextUrl, navigate])

  return <Loading />
}

export default RedirectLoading
