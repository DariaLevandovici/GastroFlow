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

function dashboardPathForRoleId(roleId?: number) {
  if (roleId === 4) return '/admin';
  if (roleId === 3) return '/manager';
  if (roleId === 2) return '/cook';
  if (roleId === 1) return '/waiter';
  if (roleId === 0) return '/menu';
  return '/login';
}

function ProtectedRoute({ allowedRoleIds, children }: { allowedRoleIds: number[]; children: ReactNode }) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoleIds.includes(user.roleId)) {
    return <Navigate to={dashboardPathForRoleId(user.roleId)} replace />;
  }

  return <>{children}</>;
}

const adminOnly = [4];
const clientAccess = [0, 4];
const waiterAccess = [1, 4];
const cookAccess = [2, 4];
const managerAccess = [3, 4];

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
  { path: '/dashboard/client', element: <ProtectedRoute allowedRoleIds={clientAccess}><Layout showFooter={false}><ClientDashboard /></Layout></ProtectedRoute> },
  { path: '/waiter', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterDashboard /></ProtectedRoute> },
  { path: '/waiter/create-order', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterCreateOrder /></ProtectedRoute> },
  { path: '/waiter/bill', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterBillPage /></ProtectedRoute> },
  { path: '/dashboard/waiter', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterDashboard /></ProtectedRoute> },
  { path: '/dashboard/waiter/create-order', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterCreateOrder /></ProtectedRoute> },
  { path: '/dashboard/waiter/bill', element: <ProtectedRoute allowedRoleIds={waiterAccess}><WaiterBillPage /></ProtectedRoute> },
  { path: '/cook', element: <ProtectedRoute allowedRoleIds={cookAccess}><CookDashboard /></ProtectedRoute> },
  { path: '/cook/recipes', element: <ProtectedRoute allowedRoleIds={cookAccess}><CookRecipesPage /></ProtectedRoute> },
  { path: '/dashboard/cook', element: <ProtectedRoute allowedRoleIds={cookAccess}><CookDashboard /></ProtectedRoute> },
  { path: '/dashboard/cook/recipes', element: <ProtectedRoute allowedRoleIds={cookAccess}><CookRecipesPage /></ProtectedRoute> },
  { path: '/admin', element: <ProtectedRoute allowedRoleIds={adminOnly}><AdminPage /></ProtectedRoute> },
  { path: '/manager', element: <ProtectedRoute allowedRoleIds={managerAccess}><ManagerDashboard /></ProtectedRoute> },
  { path: '/manager/staff-accounts', element: <ProtectedRoute allowedRoleIds={adminOnly}><StaffAccountsPage /></ProtectedRoute> },
  { path: '/dashboard/manager', element: <ProtectedRoute allowedRoleIds={managerAccess}><ManagerDashboard /></ProtectedRoute> },
  { path: '/dashboard/manager/staff-accounts', element: <ProtectedRoute allowedRoleIds={adminOnly}><StaffAccountsPage /></ProtectedRoute> },
]);
