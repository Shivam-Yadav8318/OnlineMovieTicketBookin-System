import React from 'react'
import HeroSection from '../components/HeroSection'
import FeatureSection from '../components/FeatureSection'
import TrailerSection from '../components/TrailerSection'
import { useAppContext } from '../context/AppContext'

const Home = () => {
  const { shows } = useAppContext()

  return (
    <div>
      <HeroSection movie={shows?.[0]} />
      <FeatureSection/>
      <TrailerSection/>
    </div>
  )
}

export default Home
