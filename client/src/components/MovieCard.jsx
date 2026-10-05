import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormet'

const MovieCard = ({ movie }) => {
    const navigate = useNavigate()

    const genreLabel = (movie.genres || [])
        .slice(0, 2)
        .map((genre) => (typeof genre === 'string' ? genre : genre.name))
        .join(" | ")

    const runtimeLabel = movie.runtime
        ? (isNaN(Number(movie.runtime)) ? movie.runtime : timeFormat(Number(movie.runtime)))
        : ''

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ''

    return (
        <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>

            <img
                onClick={() => {
                    navigate(`/movies/${movie._id}`)
                    scrollTo(0, 0)
                }}
                src={movie.backdrop_path || movie.poster_path}
                alt={movie.title}
                className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer'
            />

            <p className='font-semibold mt-2 truncate'>
                {movie.title}
            </p>

            <p className='text-sm text-gray-400 mt-2'>
                {releaseYear}
                {genreLabel && ` . ${genreLabel}`}
                {runtimeLabel && ` . ${runtimeLabel}`}
            </p>

            <div className='flex items-center justify-between mt-3'>

                <button
                    onClick={() => {
                        navigate(`/movies/${movie._id}`)
                        scrollTo(0, 0)
                    }}
                    className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'
                >
                    Buy Tickets
                </button>

                <p className='flex items-center gap-1 text-sm text-gray-400'>
                    <StarIcon className='h-4 w-4 text-primary fill-primary' />
                    {Number(movie.vote_average || 0).toFixed(1)}
                </p>

            </div>

        </div>
    )
}

export default MovieCard
