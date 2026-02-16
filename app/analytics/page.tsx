'use client';

import { useState, useEffect } from 'react';
import { Task, Service, Incident } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [tasksRes, servicesRes, incidentsRes] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('services').select('*'),
        supabase.from('incidents').select('*'),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (incidentsRes.error) throw incidentsRes.error;

      setTasks(tasksRes.data || []);
      setServices(servicesRes.data || []);
      setIncidents(incidentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load analytics data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const tasksByStatus = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, fill: '#6b7280' },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, fill: '#3b82f6' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, fill: '#eab308' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, fill: '#22c55e' },
  ];

  const tasksByPriority = [
    { name: 'Low', count: tasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
    { name: 'High', count: tasks.filter(t => t.priority === 'high').length },
  ];

  const serviceMetrics = services.map(service => ({
    name: service.name,
    uptime: parseFloat(service.uptime.toFixed(2)),
    latency: service.latency,
  }));

  const incidentsBySeverity = [
    { name: 'Low', value: incidents.filter(i => i.severity === 'low').length, fill: '#3b82f6' },
    { name: 'Medium', value: incidents.filter(i => i.severity === 'medium').length, fill: '#eab308' },
    { name: 'High', value: incidents.filter(i => i.severity === 'high').length, fill: '#f97316' },
    { name: 'Critical', value: incidents.filter(i => i.severity === 'critical').length, fill: '#ef4444' },
  ];

  const aiInsights = [
    {
      title: 'Task Completion Rate',
      value: tasks.length > 0 ? `${((tasks.filter(t => t.status === 'done').length / tasks.length) * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Active Incidents',
      value: incidents.filter(i => i.status !== 'resolved').length.toString(),
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Avg System Uptime',
      value: services.length > 0 ? `${(services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)}%` : '0%',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Tasks',
      value: tasks.length.toString(),
      icon: BarChart3,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics & Insights</h1>
            <p className="text-sm text-gray-400">
              AI-powered analytics and MCP integration dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {aiInsights.map((insight, index) => (
            <Card key={index} className="border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full ${insight.bgColor} p-3`}>
                  <insight.icon className={`h-6 w-6 ${insight.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{insight.title}</p>
                  <p className="text-2xl font-bold text-white">{insight.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Tasks by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Tasks by Priority</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Service Uptime</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={serviceMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[95, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Line type="monotone" dataKey="uptime" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="border-gray-800 bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Incidents by Severity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incidentsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {incidentsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="mt-6 border-blue-800 bg-blue-500/5 p-6">
          <h2 className="mb-2 text-lg font-semibold text-blue-400">MCP Integration Ready</h2>
          <p className="text-sm text-gray-300">
            This dashboard is designed to integrate with the Model Context Protocol (MCP) for enhanced
            AI-driven insights and automated decision-making. Connect your MCP server to enable
            advanced analytics, predictive modeling, and intelligent automation capabilities.
          </p>
        </Card>
      </div>
    </div>
  );
}
