import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { DateRangePicker } from './analytics/DateRangePicker';
import { ExportButton } from './analytics/ExportButton';
import { TaskCompletionChart } from './analytics/TaskCompletionChart';
import { FieldHealthChart } from './analytics/FieldHealthChart';
import { TeamPerformanceChart } from './analytics/TeamPerformanceChart';
import { NotificationStatsChart } from './analytics/NotificationStatsChart';
import AuditLogViewer from './AuditLogViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { subDays, format, isWithinInterval } from 'date-fns';

const Analytics: React.FC = () => {
  const { tasks, fields, teamMembers } = useAppContext();
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
    fetchAuditLogs();
  }, [startDate, endDate]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    setNotifications(data || []);
  };

  const fetchAuditLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    setAuditLogs(data || []);
  };

  const taskCompletionData = generateTaskCompletionData();
  const fieldHealthData = generateFieldHealthData();
  const teamPerformanceData = generateTeamPerformanceData();
  const notificationStatsData = generateNotificationStatsData();

  function generateTaskCompletionData() {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = subDays(endDate, days - i - 1);
      const dateStr = format(date, 'MMM dd');
      const tasksOnDate = tasks.filter(t => {
        const taskDate = new Date(t.due_date);
        return format(taskDate, 'MMM dd') === dateStr;
      });
      data.push({
        date: dateStr,
        completed: tasksOnDate.filter(t => t.status === 'completed').length,
        inProgress: tasksOnDate.filter(t => t.status === 'in_progress').length,
        pending: tasksOnDate.filter(t => t.status === 'pending').length,
      });
    }
    return data;
  }

  function generateFieldHealthData() {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = subDays(endDate, days - i - 1);
      data.push({
        date: format(date, 'MMM dd'),
        healthy: fields.filter(f => f.status === 'healthy').length,
        needsAttention: fields.filter(f => f.status === 'needs_attention').length,
        critical: fields.filter(f => f.status === 'critical').length,
      });
    }
    return data;
  }

  function generateTeamPerformanceData() {
    return teamMembers.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_to === member.id);
      const completed = memberTasks.filter(t => t.status === 'completed').length;
      return {
        name: member.name.split(' ')[0],
        tasksCompleted: completed,
        tasksAssigned: memberTasks.length,
        completionRate: memberTasks.length > 0 ? (completed / memberTasks.length) * 100 : 0,
      };
    });
  }

  function generateNotificationStatsData() {
    const types = notifications.reduce((acc: any, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(types).map(([name, value]) => ({ name, value: value as number }));
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-8 text-glass-primary">
        <h1 className="text-4xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-primary">Interactive performance metrics and insights</p>
      </div>

      <div className="glass-card rounded-xl p-4 flex justify-between items-center">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <ExportButton data={{ tasks, fields, teamMembers, notifications }} filename="analytics-data" />
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskCompletionChart data={taskCompletionData} />
            <FieldHealthChart data={fieldHealthData} />
            <TeamPerformanceChart data={teamPerformanceData} />
            <NotificationStatsChart data={notificationStatsData} />
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
