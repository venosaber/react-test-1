import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import {Products, Orders} from './pages'

const router = createBrowserRouter([
    {
        path: '/products',
        element: <Products/>
    },
    {
        path: '/orders',
        element: <Orders/>
    },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <RouterProvider router={router} />
  </StrictMode>,
)
