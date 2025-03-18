import React, { useEffect, useState } from 'react'
import { BrowserRouter ,Routes,Route, useNavigate} from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import Signup from './pages/Signup/Signup.jsx'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"

const App = () => {


  return(
    
  <BrowserRouter>
  <Routes>
  <Route path='/' element={<Home/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/signup' element={<Signup/>}/>
    
  </Routes>
  <ToastContainer position="top-center"/>
  </BrowserRouter>)
}

export default App
