import React from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import { useClerk } from '@clerk/react'

const Favorite = () => {
  const { favoriteMovies, isSignedIn } = useAppContext()
  const { openSignIn } = useClerk()

  if (!isSignedIn) {
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <h1 className='text-2xl font-medium text-center'>Please login to view your favorite movies</h1>
        <button onClick={openSignIn} className='px-6 py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
          Login
        </button>
      </div>
    )
  }

  return favoriteMovies.length>0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h[80vh]'>
  <BlurCircle top="150px" left="0px"/>
  <BlurCircle bottom="50px" right="50px"/>
    <h1 className='text-lg font-medium my-4'>Your Favorite Movies</h1>
    <div className='flex flex-wrap max-sm:justify-center gap-8'>
      {favoriteMovies.map((movie)=>(
        <MovieCard movie={movie} key={movie._id}/>
      ))}
    </div>

    </div>
  ): (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movie Available</h1>
    </div>
  )
}

export default Favorite
