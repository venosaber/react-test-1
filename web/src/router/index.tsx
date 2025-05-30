import { createBrowserRouter } from 'react-router-dom'
import {Products, Orders} from '../pages'

const router = createBrowserRouter([
    {
        path: '/products',
        element: <Products />
    },
    {
        path: '/orders',
        element: <Orders />
    },


])

export default router;