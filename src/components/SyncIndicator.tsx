import { useAppContext } from '@/contexts/AppContext';
import { RefreshCw, Wifi, WifiOff, Cloud } from 'lucide-react';

export const SyncIndicator = () => {
  const { syncing, isOnline, pendingChanges } = useAppContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Syncing indicator */}
      {syncing && (
        <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Syncing...</span>
        </div>
      )}

      {/* Connection status */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
        isOnline ? 'bg-green-500' : 'bg-orange-500'
      } text-white`}>
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Pending changes indicator */}
      {pendingChanges > 0 && (
        <div className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <Cloud className="h-4 w-4" />
          <span className="text-sm font-medium">{pendingChanges} pending</span>
        </div>
      )}
    </div>
  );
};
