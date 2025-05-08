import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import RegisterPlan from '../pages/RegisterPlan/RegisterPlan';
import ListPlans from '../pages/ListPlans/ListPlans';
import EditPlan from '../pages/EditPlan/EditPlan';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/planos/cadastrar',
    element: <RegisterPlan />
  },
  {
    path: '/planos',
    element: <ListPlans />
  },
  {
    path: '/planos/editar/:id',
    element: <EditPlan />
  }
]);

export default router; 