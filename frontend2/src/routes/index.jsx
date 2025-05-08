import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home/Home';
import RegisterSprint from '../pages/RegisterSprint/RegisterSprint';
import RegisterStudent from '../pages/RegisterStudent/RegisterStudent';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register-sprint',
    element: <RegisterSprint />,
  },
  {
    path: '/register-student',
    element: <RegisterStudent />,
  }
]); 