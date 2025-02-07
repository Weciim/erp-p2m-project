import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const NotFound = lazy(() => import('@/pages/NotFound.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));


let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
    
    },
    {
      path: '/',
      element: <Dashboard />,
    },

    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
