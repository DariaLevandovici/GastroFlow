import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { ReservationPage } from './pages/ReservationPage';
import { CareerPage } from './pages/CareerPage';
import { OrderPage } from './pages/OrderPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { WaiterCreateOrder } from './pages/WaiterCreateOrder';
import { WaiterBillPage } from './pages/WaiterBillPage';
import { CookDashboard } from './pages/CookDashboard';
import { CookRecipesPage } from './pages/CookRecipesPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { FeedbackPage } from './pages/FeedbackPage';
import { Layout } from './components/layout/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><HomePage /></Layout>
  },
  {
    path: '/menu',
    element: <Layout><MenuPage /></Layout>
  },
  {
    path: '/cart',
    element: <Layout><CartPage /></Layout>
  },
  {
    path: '/reservation',
    element: <Layout><ReservationPage /></Layout>
  },
  {
    path: '/career',
    element: <Layout><CareerPage /></Layout>
  },
  {
    path: '/feedback',
    element: <Layout><FeedbackPage /></Layout>
  },
  {
    path: '/order',
    element: <Layout><OrderPage /></Layout>
  },
  {
    path: '/login',
    element: <Layout showFooter={false}><LoginPage /></Layout>
  },
  {
    path: '/account',
    element: <Layout showFooter={false}><AccountPage /></Layout>
  },
  {
    path: '/dashboard/client',
    element: <Layout showFooter={false}><ClientDashboard /></Layout>
  },
  {
    path: '/dashboard/waiter',
    element: <WaiterDashboard />
  },
  {
    path: '/dashboard/waiter/create-order',
    element: <WaiterCreateOrder />
  },
  {
    path: '/dashboard/waiter/bill',
    element: <WaiterBillPage />
  },
  {
    path: '/dashboard/cook',
    element: <CookDashboard />
  },
  {
    path: '/dashboard/cook/recipes',
    element: <CookRecipesPage />
  },
  {
    path: '/dashboard/manager',
    element: <ManagerDashboard />
  }
]);
