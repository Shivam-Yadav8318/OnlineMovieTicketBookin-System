import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import React from 'react'
import { assets } from '../assets/assets'
import backgroundImage from '../assets/backgroundImage.png'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormet'

const HeroSection = ({ movie }) => {
    const navigat=useNavigate()

    // Fall back to the original static content if no "now showing" movie
    // could be loaded from the backend yet, so the hero always looks good.
    const title = movie?.title ?? 'Guardians Of the Galaxy'
    const genres = movie?.genres?.length
        ? movie.genres.slice(0, 3).map((g) => (typeof g === 'string' ? g : g.name)).join(' | ')
        : 'Action | Adventure | Sci-fi'
    const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : 2018
    const runtime = movie?.runtime
        ? (isNaN(Number(movie.runtime)) ? movie.runtime : timeFormat(Number(movie.runtime)))
        : '2h 8m'
    const overview = movie?.overview ?? "In a post-apocalyptic world where cities ride on whells and consuem eact onter to survive , two people meet in lodon and try to stop a conspiracy."
    const exploreTarget = movie ? `/movies/${movie._id}` : '/movies'

  return (
    <div
      className='flex flex-col items-center justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen items-start text-left w-full '
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <img
        src={assets.marvelLogo}
        alt=""
        className="max-h-11 lg:h-11 mt-20"
      />

      <h1 className='text-5xl md:text-[62px] md:leading-18 font-semibold max-w-110'>
        {title}
      </h1>

      <div className='flex items-center gap-4 text-gray-300'>
        <span>{genres}</span>

        <div className='flex items-center gap-1'>
          <CalendarIcon className='w-4.5 h-4.5' />
          {year}
        </div>

        <div className='flex items-center gap-1'>
          <ClockIcon className='w-4.5 h-4.5' />
          {runtime}
        </div>
      </div>
      <p className='max-w-md text-gray-300 line-clamp-3'>{overview}</p>
       <button onClick={()=>navigat(exploreTarget)} className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Explore movies  <ArrowRight className='w-5 h-5'/></button>
      
    </div>
  )
}

export default HeroSection
