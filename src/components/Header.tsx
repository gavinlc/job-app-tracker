import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: { displayName?: string; primaryEmail?: string } | null;
  onSignOut: () => Promise<void>;
}

export function Header({ user, onSignOut }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Job Application Tracker</h1>
            <p className="text-sm text-slate-600">Track and manage your job applications</p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-600">
                {user.displayName || user.primaryEmail || 'User'}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

