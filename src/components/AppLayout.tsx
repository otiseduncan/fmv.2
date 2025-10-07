import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNotifications } from '@/hooks/useNotifications';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import FieldsGrid from './FieldsGrid';
import TaskManager from './TaskManager';
import TeamSection from './TeamSection';
import Analytics from './Analytics';
import Settings from './Settings';
import WeatherWidget from './WeatherWidget';
import { SyncIndicator } from './SyncIndicator';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Initialize notifications system (subscribes to real-time updates)
  useNotifications();


  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Dashboard />
            <WeatherWidget />
          </div>
        );
      case 'fields':
        return <FieldsGrid />;
      case 'tasks':
        return <TaskManager />;
      case 'team':
        return <TeamSection />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SyncIndicator />
      
      <Navigation 
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className={`transition-all ${isMobile ? 'pt-16' : ''} ${
        !isMobile ? 'ml-64' : ''
      }`}>
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
