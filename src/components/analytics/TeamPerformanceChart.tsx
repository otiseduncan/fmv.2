import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamPerformanceChartProps {
  data: Array<{
    name: string;
    tasksCompleted: number;
    tasksAssigned: number;
    completionRate: number;
  }>;
}

export const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tasksCompleted" fill="#10b981" name="Completed" />
            <Bar dataKey="tasksAssigned" fill="#3b82f6" name="Assigned" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
