import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { ReservationPage } from './pages/ReservationPage';
import { CareerPage } from './pages/CareerPage';
import { OrderPage } from './pages/OrderPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { WaiterCreateOrder } from './pages/WaiterCreateOrder';
import { WaiterBillPage } from './pages/WaiterBillPage';
import { CookDashboard } from './pages/CookDashboard';
import { CookRecipesPage } from './pages/CookRecipesPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { AdminPage } from './pages/AdminPage';
import { StaffAccountsPage } from './pages/StaffAccountsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPage } from './pages/CookiesPage';
import { Layout } from './components/layout/Layout';
import { useApp } from './context/AppContext';

function dashboardPathForRole(role?: string) {
  if (role === 'admin') return '/admin';
  if (role === 'manager') return '/dashboard/manager';
  if (role === 'waiter') return '/dashboard/waiter';
  if (role === 'cook') return '/dashboard/cook';
  if (role === 'client') return '/dashboard/client';
  return '/login';
}

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: string[]; children: ReactNode }) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
}

const adminOnly = ['admin'];
const clientAccess = ['client', 'admin'];
const waiterAccess = ['waiter', 'admin'];
const cookAccess = ['cook', 'admin'];
const managerAccess = ['manager', 'admin'];

export const router = createBrowserRouter([
  { path: '/', element: <Layout><HomePage /></Layout> },
  { path: '/menu', element: <Layout><MenuPage /></Layout> },
  { path: '/cart', element: <Layout><CartPage /></Layout> },
  { path: '/reservation', element: <Layout><ReservationPage /></Layout> },
  { path: '/career', element: <Layout><CareerPage /></Layout> },
  { path: '/feedback', element: <Layout><FeedbackPage /></Layout> },
  { path: '/order', element: <Layout><OrderPage /></Layout> },
  { path: '/privacy', element: <Layout><PrivacyPage /></Layout> },
  { path: '/terms', element: <Layout><TermsPage /></Layout> },
  { path: '/cookies', element: <Layout><CookiesPage /></Layout> },
  { path: '/login', element: <Layout showFooter={false}><LoginPage /></Layout> },
  { path: '/register', element: <Layout showFooter={false}><RegisterPage /></Layout> },
  { path: '/account', element: <Layout showFooter={false}><AccountPage /></Layout> },
  { path: '/dashboard/client', element: <ProtectedRoute allowedRoles={clientAccess}><Layout showFooter={false}><ClientDashboard /></Layout></ProtectedRoute> },
  { path: '/dashboard/waiter', element: <ProtectedRoute allowedRoles={waiterAccess}><WaiterDashboard /></ProtectedRoute> },
  { path: '/dashboard/waiter/create-order', element: <ProtectedRoute allowedRoles={waiterAccess}><WaiterCreateOrder /></ProtectedRoute> },
  { path: '/dashboard/waiter/bill', element: <ProtectedRoute allowedRoles={waiterAccess}><WaiterBillPage /></ProtectedRoute> },
  { path: '/dashboard/cook', element: <ProtectedRoute allowedRoles={cookAccess}><CookDashboard /></ProtectedRoute> },
  { path: '/dashboard/cook/recipes', element: <ProtectedRoute allowedRoles={cookAccess}><CookRecipesPage /></ProtectedRoute> },
  { path: '/admin', element: <ProtectedRoute allowedRoles={adminOnly}><AdminPage /></ProtectedRoute> },
  { path: '/dashboard/manager', element: <ProtectedRoute allowedRoles={managerAccess}><ManagerDashboard /></ProtectedRoute> },
  { path: '/dashboard/manager/staff-accounts', element: <ProtectedRoute allowedRoles={managerAccess}><StaffAccountsPage /></ProtectedRoute> },
]);
