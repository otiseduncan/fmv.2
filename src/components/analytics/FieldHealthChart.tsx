import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldHealthChartProps {
  data: Array<{
    date: string;
    healthy: number;
    needsAttention: number;
    critical: number;
  }>;
}

export const FieldHealthChart: React.FC<FieldHealthChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="healthy" stackId="1" stroke="#10b981" fill="#10b981" name="Healthy" />
            <Area type="monotone" dataKey="needsAttention" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Needs Attention" />
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" name="Critical" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
