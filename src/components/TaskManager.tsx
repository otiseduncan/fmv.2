import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Plus, Loader2, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { logAuditAction } from '@/lib/auditLogger';
import { supabase } from '@/lib/supabase';

const TaskManager: React.FC = () => {
  const { tasks, teamMembers, fields, loading, updateTask, addTask } = useAppContext();
  const { canCreateTask, canEditTask, canUpdateTaskStatus, profile } = useAuth();

  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', field_id: '', assigned_to: '', priority: 'low' as 'high' | 'medium' | 'low', due_date: ''
  });

  const priorities = ['all', 'high', 'medium', 'low'];
  const statuses = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-primary/20 text-primary border-primary/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-white/10 text-glass-secondary border-white/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-primary" />;
      default: return <Clock className="w-5 h-5 text-glass-secondary" />;
    }
  };

  // Check for overdue tasks and notify managers
  useEffect(() => {
    const checkOverdueTasks = async () => {
      const now = new Date();
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return task.status !== 'completed' && task.status !== 'cancelled' && dueDate < now;
      });

      for (const task of overdueTasks) {
        const managers = teamMembers.filter(m => m.role === 'manager' || m.role === 'admin');
        for (const manager of managers) {
          await supabase.functions.invoke('create-notification', {
            body: {
              userId: manager.id,
              title: '⚠️ Overdue Task',
              message: `Task "${task.title}" is overdue (due: ${new Date(task.due_date).toLocaleDateString()})`,
              type: 'overdue_task',
              severity: 'warning',
              metadata: { taskId: task.id, dueDate: task.due_date }
            }
          });
        }
      }
    };

    const interval = setInterval(checkOverdueTasks, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [tasks, teamMembers]);

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const oldStatus = selectedTask.status;
    const task = tasks.find(t => t.id === taskId);
    
    await updateTask(taskId, { status: newStatus as any });
    await logAuditAction('STATUS_CHANGE', 'tasks', taskId, { status: oldStatus }, { status: newStatus });
    
    // Notify managers when workers update task status
    if (profile?.role === 'worker') {
      const managers = teamMembers.filter(m => m.role === 'manager' || m.role === 'admin');
      for (const manager of managers) {
        await supabase.functions.invoke('create-notification', {
          body: {
            userId: manager.id,
            title: '📋 Task Status Updated',
            message: `${profile.full_name} updated "${task?.title}" from ${oldStatus} to ${newStatus}`,
            type: 'task_update',
            severity: newStatus === 'completed' ? 'success' : 'info',
            metadata: { taskId, oldStatus, newStatus, updatedBy: profile.id }
          }
        });
      }
    }
    
    setSelectedTask(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = crypto.randomUUID();
    const newTask = {
      ...formData,
      id: taskId,
      status: 'pending' as any
    };
    await addTask(newTask);
    await logAuditAction('CREATE', 'tasks', taskId, null, newTask);
    
    // Notify assigned team member
    if (formData.assigned_to) {
      await supabase.functions.invoke('create-notification', {
        body: {
          userId: formData.assigned_to,
          title: '🎯 New Task Assigned',
          message: `You have been assigned: "${newTask.title}"`,
          type: 'task_assigned',
          severity: 'info',
          metadata: { taskId: taskId }
        }
      });
    }
    
    setShowAddTask(false);
    setFormData({ title: '', description: '', field_id: '', assigned_to: '', priority: 'low' as 'high' | 'medium' | 'low', due_date: '' });
  };




  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-8 text-glass-primary">
        <h1 className="text-4xl font-bold mb-2">Task Management</h1>
        <p className="text-primary">Track and manage field operations</p>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary focus:ring-2 focus:ring-primary"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority} className="text-gray-900">
                  {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary focus:ring-2 focus:ring-primary"
            >
              {statuses.map(status => (
                <option key={status} value={status} className="text-gray-900">
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="cherry-red-btn px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-glass-primary">Active Tasks</h3>
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const assignee = teamMembers.find(m => m.id === task.assigned_to);
              const field = fields.find(f => f.id === task.field_id);
              
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getPriorityColor(task.priority)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    </div>
                    {getStatusIcon(task.status)}
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-sm">
                      {assignee && (
                        <div className="flex items-center">
                          <img src={assignee.avatar_url} alt={assignee.name} className="w-6 h-6 rounded-full mr-2" />
                          <span className="text-gray-700">{assignee.name}</span>
                        </div>
                      )}
                      {field && (
                        <span className="text-gray-600">📍 {field.name}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-glass-primary">Task Timeline</h3>
          <div className="space-y-4">
            {filteredTasks.slice(0, 5).map((task, idx) => (
              <div key={task.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    task.status === 'completed' ? 'bg-green-400/20 text-green-400 border-green-400/30' :
                    task.status === 'in_progress' ? 'bg-gray-400/20 text-gray-400 border-gray-400/30' :
                    'bg-white/10 text-glass-secondary border-white/20'
                  }`}>
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-glass-primary">{task.title}</p>
                  <p className="text-sm text-glass-secondary">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-semibold mb-4 text-glass-primary">{selectedTask.title}</h3>
            <p className="text-glass-secondary mb-6">{selectedTask.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="text-sm text-glass-secondary mb-1">Priority</p>
                <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <p className="text-sm text-glass-secondary mb-1">Status</p>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                  className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-glass-primary"
                >
                  <option value="pending" className="text-gray-900">Pending</option>
                  <option value="in_progress" className="text-gray-900">In Progress</option>
                  <option value="completed" className="text-gray-900">Completed</option>
                  <option value="cancelled" className="text-gray-900">Cancelled</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setSelectedTask(null)}
              className="w-full px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-glass-primary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-glass-primary">Create New Task</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary placeholder:text-glass-secondary/60"
                  required
                />
                <textarea
                  placeholder="Task description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary placeholder:text-glass-secondary/60"
                  rows={3}
                />
                <select 
                  value={formData.field_id}
                  onChange={(e) => setFormData({...formData, field_id: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary"
                >
                  <option value="" className="text-gray-900">Select Job</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id} className="text-gray-900">{field.name}</option>
                  ))}
                </select>
                <select 
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary"
                >
                  <option value="" className="text-gray-900">Assign to</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id} className="text-gray-900">{member.name}</option>
                  ))}
                </select>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'high' | 'medium' | 'low'})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary"
                >
                  <option value="low" className="text-gray-900">Low Priority</option>
                  <option value="medium" className="text-gray-900">Medium Priority</option>
                  <option value="high" className="text-gray-900">High Priority</option>
                </select>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-glass-primary"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 text-glass-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cherry-red-btn flex-1 px-4 py-2 rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
