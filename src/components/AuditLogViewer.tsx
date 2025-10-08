import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Filter, Calendar, User, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AuditLog {
  id: string;
  created_at: string;
  user_email: string;
  user_role: string;
  action_type: string;
  table_name: string;
  description: string;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: 'all',
    tableName: 'all',
    dateRange: 7
  });

  useEffect(() => {
    fetchLogs();
    const subscription = supabase
      .channel('audit_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, 
        () => fetchLogs())
      .subscribe();
    return () => { subscription.unsubscribe(); };
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    
    if (filters.actionType !== 'all') query = query.eq('action_type', filters.actionType);
    if (filters.tableName !== 'all') query = query.eq('table_name', filters.tableName);
    
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - filters.dateRange);
    query = query.gte('created_at', dateLimit.toISOString());

    const { data } = await query;
    setLogs(data || []);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    const colors: any = { CREATE: 'text-green-600', UPDATE: 'text-gray-600', DELETE: 'text-red-600', 
      STATUS_CHANGE: 'text-yellow-600', ASSIGN: 'text-purple-600' };
    return colors[action] || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <select value={filters.actionType} onChange={(e) => setFilters({...filters, actionType: e.target.value})}
            className="px-3 py-2 border rounded-lg">
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="STATUS_CHANGE">Status Change</option>
          </select>
          <select value={filters.tableName} onChange={(e) => setFilters({...filters, tableName: e.target.value})}
            className="px-3 py-2 border rounded-lg">
            <option value="all">All Tables</option>
            <option value="fields">Fields</option>
            <option value="tasks">Tasks</option>
            <option value="team_members">Team Members</option>
          </select>
          <select value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: parseInt(e.target.value)})}
            className="px-3 py-2 border rounded-lg">
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </Card>

      <div className="space-y-2">
        {loading ? (
          <Card className="p-8 text-center text-gray-500">Loading...</Card>
        ) : logs.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">No audit logs found</Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${getActionColor(log.action_type)}`}>
                      {log.action_type}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{log.table_name}</span>
                  </div>
                  <p className="text-gray-700">{log.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {log.user_email}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{log.user_role}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
