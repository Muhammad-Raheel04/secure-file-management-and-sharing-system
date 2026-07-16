import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './pages/Register';
import Login from './pages/Login';
import UploadFile from './pages/UploadFile';
import ProtectRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <><ProtectRoute><UploadFile></UploadFile></ProtectRoute></>
  },
  {
    path: "/register",
    element: <><Signup></Signup></>
  },
  {
    path: "/login",
    element: <><Login></Login></>
  }
])
const App = () => {
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App
