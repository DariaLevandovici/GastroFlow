import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../ui/button';

interface AdminNavigationState {
  fromAdmin?: boolean;
}

interface AdminBackButtonProps {
  className?: string;
}

export function AdminBackButton({ className = '' }: AdminBackButtonProps) {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AdminNavigationState | null;

  if (user?.role !== 'admin' && !state?.fromAdmin) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/admin')}
      variant="secondary"
      className={`border border-blue-700/40 bg-blue-900/30 text-blue-100 hover:bg-blue-800/50 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Admin Dashboard
    </Button>
  );
}
