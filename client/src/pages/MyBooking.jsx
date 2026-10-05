import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormet'
import { dateFormat } from '../lib/dateFormet'
import { useAppContext } from '../context/AppContext'
import { useUser, useClerk } from '@clerk/react'

const MyBooking = () => {
  const { axios, currency } = useAppContext()
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()

  const [bookings,setBookings]=useState([])
  const[isLoading , setIsLoading] = useState(true)

  const getMyBookings=async()=>{
    try {
      setIsLoading(true)
      const { data } = await axios.get('/api/user/bookings')
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.log('Get my bookings error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    if (isSignedIn) {
      getMyBookings()
    } else {
      setIsLoading(false)
    }
  },[isSignedIn])

  if (isLoading) {
    return <Loading/>
  }

  if (!isSignedIn) {
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-2xl font-medium text-center'>Please login to view your bookings</h1>
        <button onClick={openSignIn} className='px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
          Login
        </button>
      </div>
    )
  }

  return (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <BlurCircle top='100px' left='100px'/>
      <div><BlurCircle bottom='0px' left='600px'/></div>
      <h1 className='text-lg font-semibold mb-4'>My Bookings</h1>

      {bookings.length === 0 && (
        <p className='text-gray-400'>You have no bookings yet.</p>
      )}

      {bookings.map((item,index)=>(
        <div key={item._id || index} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
          <div className='flex flex-col md:flex-row'>
           <img src={item.show?.movie?.poster_path} alt=" " className='md:max-w-15 aspect-video h-auto object-cover object-bottom rounded'/>
           <div className='flex flex-col p-4'>
            <p className='flex flex-col p-4'>{item.show?.movie?.title}</p>
            <p className='text-lg font-semibold'>
              {item.show?.movie?.runtime
                ? (isNaN(Number(item.show.movie.runtime)) ? item.show.movie.runtime : timeFormat(Number(item.show.movie.runtime)))
                : ''}
            </p>
            <p className='text-gray-400 text-sm mt-auto'>{dateFormat(item.show?.showDateTime)}</p>
           </div>

          </div>
       <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
      <div className='flex items-center gap-4'>
        <p className='text-2xl font-semibold mb-3'>{currency}{item.amount}</p>
        {!item.isPaid && (
          <button
            onClick={() => item.paymentLink && window.open(item.paymentLink, '_self')}
            className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'
          >
            Pay Now
          </button>
        )}
      </div>
      <div className='text-sm'>
        <p><span className='text-gray-400'>Total Tickets:</span> {item.bookedSeats.length}</p>
        <p><span className='text-gray-400'>Seat Number:</span> {item.bookedSeats.join(", ")}</p>
      </div>

       </div>



        </div>
      ))

      }

  </div>
  )
}

export default MyBooking
