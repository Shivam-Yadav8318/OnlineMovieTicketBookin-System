import React from 'react'
import Navbar from './components/Navbar'
import { Routes ,Route, useLocation} from 'react-router-dom'
import  Home  from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBooking from './pages/MyBooking'
import Favorite from './pages/Favorite'
import Theaters from './pages/Theaters'
import RedirectLoading from './pages/RedirectLoading'
import {Toaster} from 'react-hot-toast'
import Footer from './components/Footer'
import Layout from './pages/admin/Layout'
import AddShows from './pages/admin/AddShows'
import ListShow from './pages/admin/ListShow'
import ListBooking from './pages/admin/ListBooking'
import Dashboard from './pages/admin/Dashboard'
const App = () => {
  const isAdminDashboard=useLocation().pathname.startsWith('/admin');
  return (
    <>
    <Toaster/>
    {! isAdminDashboard && <Navbar/>}
    <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/movies' element={<Movies/>}/>
       <Route path='/movies/:id' element={<MovieDetails/>}/>
        <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
        <Route path='/my-bookings' element={<MyBooking/>}/>
       <Route path='/favorite' element={<Favorite/>}/>
       <Route path='/theaters' element={<Theaters/>}/>
       <Route path='/loading/:nextUrl' element={<RedirectLoading/>}/>
       <Route path='/admin/*' element={<Layout/>}>
       <Route index element={<Dashboard/>}/>
       <Route path='add-shows' element={<AddShows/>}/>
       <Route path='list-shows' element={<ListShow/>}/>
       <Route path='list-bookings' element={<ListBooking/>}/>
       </Route>


       
    </Routes>
    {!isAdminDashboard && <Footer/>}
    </>
  )
}

export default App