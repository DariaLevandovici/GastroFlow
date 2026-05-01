import { Outlet, RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { ScrollToTop } from './components/ScrollToTop';

export function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
