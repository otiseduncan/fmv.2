import React from 'react';
import { Home, Map, Users, CheckSquare, BarChart3, Settings, Bell, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, sidebarOpen, toggleSidebar }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'fields', label: 'Jobs', icon: Map },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast({ title: 'Success', description: 'Logged out successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 glass-nav z-40">
        <div className="flex items-center justify-between p-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-lg text-glass-primary">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl font-bold text-glass-primary">DriveOps-IQ</h1>
          <button className="relative p-2 hover:bg-white/10 rounded-lg text-glass-primary">
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full glass-nav z-30 transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-glass-primary">DriveOps-IQ</h1>
          <p className="text-sm text-glass-secondary mt-1">Intelligent Operations for the Modern Field.</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveView(item.id);
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'cherry-red-btn font-medium'
                        : 'text-glass-secondary hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-glass-primary truncate">
                {profile?.full_name || user?.email}
              </p>
              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                {profile?.role || 'worker'}
              </Badge>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-glass-secondary hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Navigation;

