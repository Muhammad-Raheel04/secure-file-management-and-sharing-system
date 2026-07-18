import React from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './pages/Register';
import Login from './pages/Login';
import UploadFile from './pages/UploadFile';
import ProtectRoute from './components/ProtectedRoute';
import FileViewer from './pages/FileViewer';

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
  },
  {
    path:'/file/:id/view',
    element:<><FileViewer></FileViewer></>
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
