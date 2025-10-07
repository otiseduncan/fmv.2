export interface QueuedOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'fields' | 'tasks' | 'team_members' | 'weather_data';
  data: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline_queue';

export const offlineQueue = {
  add: (operation: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
    const queue = offlineQueue.getAll();
    const newOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };
    queue.push(newOp);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return newOp;
  },

  getAll: (): QueuedOperation[] => {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  remove: (id: string) => {
    const queue = offlineQueue.getAll().filter(op => op.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  clear: () => {
    localStorage.removeItem(QUEUE_KEY);
  },
};
