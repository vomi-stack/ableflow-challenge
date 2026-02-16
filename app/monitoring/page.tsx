'use client';

import { useState, useEffect } from 'react';
import { Service } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { triggerIncidentAlert } from '@/lib/incident-response';

export default function MonitoringPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
    const interval = setInterval(loadServices, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast.error('Failed to load services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadServices();
    toast.success('Services refreshed');
    setTimeout(() => setRefreshing(false), 1000);
  }

  async function simulateServiceStatus(serviceId: string, status: 'operational' | 'degraded' | 'down') {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      const updates: any = {
        status,
        last_check: new Date().toISOString(),
      };

      if (status === 'operational') {
        updates.uptime = 99.9 + Math.random() * 0.1;
        updates.latency = 15 + Math.floor(Math.random() * 40);
      } else if (status === 'degraded') {
        updates.uptime = 95 + Math.random() * 4;
        updates.latency = 100 + Math.floor(Math.random() * 200);
      } else {
        updates.uptime = 0;
        updates.latency = 0;
      }

      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId);

      if (error) throw error;

      if (status === 'down' || status === 'degraded') {
        await triggerIncidentAlert(serviceId, service.name);
        toast.error(`${service.name} is ${status}! Incident created.`);
      } else {
        toast.success(`${service.name} is now ${status}`);
      }

      await loadServices();
    } catch (error) {
      toast.error('Failed to update service status');
      console.error(error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'down':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return '';
    }
  };

  const overallUptime = services.length > 0
    ? (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)
    : '0.00';

  const avgLatency = services.length > 0
    ? Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length)
    : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
            <p className="text-sm text-gray-400">
              Real-time operational reliability dashboard
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-white">{overallUptime}%</p>
              </div>
            </div>
          </Card>
          <Card className="border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Latency</p>
                <p className="text-2xl font-bold text-white">{avgLatency}ms</p>
              </div>
            </div>
          </Card>
          <Card className="border-gray-800 bg-gray-900 p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-yellow-500/10 p-3">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Services</p>
                <p className="text-2xl font-bold text-white">{services.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Service Status</h2>
          {services.map((service) => (
            <Card key={service.id} className="border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('h-3 w-3 rounded-full', getStatusColor(service.status))} />
                  <div>
                    <h3 className="font-semibold text-white">{service.name}</h3>
                    <p className="text-sm text-gray-400">{service.endpoint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Uptime</p>
                    <p className="font-semibold text-white">{service.uptime.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Latency</p>
                    <p className="font-semibold text-white">{service.latency}ms</p>
                  </div>
                  <Badge variant="outline" className={cn('capitalize', getStatusBadge(service.status))}>
                    {service.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => simulateServiceStatus(service.id, 'operational')}
                  disabled={service.status === 'operational'}
                >
                  Set Operational
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => simulateServiceStatus(service.id, 'degraded')}
                  disabled={service.status === 'degraded'}
                >
                  Set Degraded
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => simulateServiceStatus(service.id, 'down')}
                  disabled={service.status === 'down'}
                >
                  Set Down
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
