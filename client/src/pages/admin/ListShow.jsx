import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { useAppContext } from '../../context/AppContext'

const ListShow = () => {
  const { axios, currency } = useAppContext()

  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)

  const getAllShows = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/admin/all-shows')
      if (data.success) {
        setShows(data.shows)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllShows()
  }, [])

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">

          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">
                Movie Name
              </th>

              <th className="p-2 font-medium">
                Show Time
              </th>

              <th className="p-2 font-medium">
                Total Booking
              </th>

              <th className="p-2 font-medium">
                Earnings
              </th>
            </tr>
          </thead>

          <tbody>
            {shows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-400">No shows found.</td>
              </tr>
            )}

            {shows.map((show, index) => {
              const totalBooking =
                Object.keys(show.occupiedSeats || {}).length

              const earnings =
                totalBooking * show.showPrice

              return (
                <tr
                  key={show._id || index}
                  className="border-b border-gray-700 text-white"
                >
                  <td className="p-2 pl-5">
                    {show.movie?.title}
                  </td>

                  <td className="p-2">
                    {new Date(
                      show.showDateTime
                    ).toLocaleString()}
                  </td>

                  <td className="p-2">
                    {totalBooking}
                  </td>

                  <td className="p-2">
                    {currency}{earnings}
                  </td>
                </tr>
              )
            })}
          </tbody>

        </table>
      </div>
    </>
  ) : (
    <Loading />
  )
}

export default ListShow
