import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './pages/Register';
import Login from './pages/Login';

const router=createBrowserRouter([
  {
    path:"/register",
    element:<><Signup></Signup></>
  },
  {
    path:"/login",
    element:<><Login></Login></>
  },
])
const App = () => {
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App
