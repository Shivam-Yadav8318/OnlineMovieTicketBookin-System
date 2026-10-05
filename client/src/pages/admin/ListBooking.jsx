import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormet'
import { useAppContext } from '../../context/AppContext'

const ListBooking = () => {
  const { axios, currency } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getAllBookings = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.get('/api/admin/all-bookings')
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getAllBookings()
  }, [])

  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">

          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">
                User Id
              </th>

              <th className="p-2 font-medium">
                Movie Name
              </th>

              <th className="p-2 font-medium">
                Show Time
              </th>

              <th className="p-2 font-medium">
                Seats
              </th>

              <th className="p-2 font-medium">
                Amount
              </th>

              <th className="p-2 font-medium">
                Paid
              </th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-gray-400">No bookings found.</td>
              </tr>
            )}

            {bookings.map((item, index) => (
              <tr
                key={item._id || index}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">
                  {item.user}
                </td>

                <td className="p-2">
                  {item.show?.movie?.title}
                </td>

                <td className="p-2">
                  {dateFormat(item.show?.showDateTime)}
                </td>

                <td className="p-2">
                  {item.bookedSeats?.join(", ")}
                </td>

                <td className="p-2">
                  {currency}{item.amount}
                </td>

                <td className="p-2">
                  {item.isPaid ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </>
  ) : (
    <Loading />
  )
}

export default ListBooking
