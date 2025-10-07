import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskCompletionChartProps {
  data: Array<{
    date: string;
    completed: number;
    pending: number;
    inProgress: number;
  }>;
}

export const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion Rates Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
            <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} name="In Progress" />
            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
