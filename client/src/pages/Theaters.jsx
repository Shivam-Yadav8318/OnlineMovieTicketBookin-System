import React from 'react'
import BlurCircle from '../components/BlurCircle'
import { MapPinIcon, PhoneIcon } from 'lucide-react'

// This project's database only tracks movies & shows (no multi-theater
// model), so the "Theaters" page presents the cinema locations this
// QuickShow booking site currently operates from.
const theaters = [
  {
    name: 'QuickShow Cinemas - Connaught Place',
    address: 'Inner Circle, Connaught Place, New Delhi, Delhi 110001',
    phone: '+91 11 2345 6789',
    screens: 6,
  },
  {
    name: 'QuickShow Cinemas - Vasant Kunj',
    address: 'DLF Promenade, Vasant Kunj, New Delhi, Delhi 110070',
    phone: '+91 11 2345 1234',
    screens: 8,
  },
  {
    name: 'QuickShow Cinemas - Saket',
    address: 'Select Citywalk, Saket, New Delhi, Delhi 110017',
    phone: '+91 11 2345 5678',
    screens: 10,
  },
]

const Theaters = () => {
  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <h1 className='text-lg font-medium my-4'>Our Theaters</h1>

      <div className='flex flex-col gap-6 mt-8 max-w-3xl'>
        {theaters.map((theater) => (
          <div
            key={theater.name}
            className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-primary/8 border border-primary/20 rounded-lg hover:-translate-y-1 transition duration-300'
          >
            <div>
              <p className='text-lg font-semibold'>{theater.name}</p>

              <p className='flex items-center gap-2 text-sm text-gray-400 mt-2'>
                <MapPinIcon className='w-4 h-4 text-primary shrink-0' />
                {theater.address}
              </p>

              <p className='flex items-center gap-2 text-sm text-gray-400 mt-1'>
                <PhoneIcon className='w-4 h-4 text-primary shrink-0' />
                {theater.phone}
              </p>
            </div>

            <div className='shrink-0 text-sm bg-primary/15 text-primary px-4 py-2 rounded-full text-center'>
              {theater.screens} Screens
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Theaters
