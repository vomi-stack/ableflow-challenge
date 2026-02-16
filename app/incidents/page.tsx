'use client';

import { useState, useEffect } from 'react';
import { Incident, Service } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createAuditLog } from '@/lib/audit';
import { analyzeIncidentPattern } from '@/lib/incident-response';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [incidentsRes, servicesRes] = await Promise.all([
        supabase.from('incidents').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*'),
      ]);

      if (incidentsRes.error) throw incidentsRes.error;
      if (servicesRes.error) throw servicesRes.error;

      setIncidents(incidentsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      toast.error('Failed to load incidents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function resolveIncident(incidentId: string) {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', incidentId);

      if (error) throw error;

      await createAuditLog('incident_resolved', 'incident', incidentId, {
        resolved_at: new Date().toISOString(),
      });

      toast.success('Incident resolved successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to resolve incident');
      console.error(error);
    }
  }

  async function investigateIncident(incidentId: string) {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: 'investigating' })
        .eq('id', incidentId);

      if (error) throw error;

      await createAuditLog('incident_investigating', 'incident', incidentId, {
        started_at: new Date().toISOString(),
      });

      toast.success('Investigation started');
      await loadData();
    } catch (error) {
      toast.error('Failed to update incident status');
      console.error(error);
    }
  }

  function getServiceName(serviceId: string): string {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'investigating':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return '';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
  const analysis = analyzeIncidentPattern(activeIncidents);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Incident Response</h1>
            <p className="text-sm text-gray-400">
              AI-powered incident detection and management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              {activeIncidents.length} Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-8">
        {analysis.recurring && (
          <Card className="mb-6 border-yellow-800 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-400">AI Pattern Detection</h3>
                <p className="text-sm text-gray-300">{analysis.recommendation}</p>
              </div>
            </div>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Active Incidents</h2>
          {activeIncidents.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900 p-8 text-center">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-400" />
              <p className="text-gray-400">No active incidents</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeIncidents.map((incident) => (
                <Card key={incident.id} className="border-gray-800 bg-gray-900 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className={cn('capitalize', getSeverityBadge(incident.severity))}>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline" className={cn('capitalize', getStatusBadge(incident.status))}>
                          {incident.status}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {getServiceName(incident.service_id)}
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold text-white">{incident.title}</h3>
                      <p className="text-sm text-gray-400">{incident.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(incident.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {incident.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => investigateIncident(incident.id)}
                        >
                          Investigate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => resolveIncident(incident.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Recently Resolved</h2>
          {resolvedIncidents.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400">No resolved incidents</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {resolvedIncidents.slice(0, 5).map((incident) => (
                <Card key={incident.id} className="border-gray-800 bg-gray-900 p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline" className={cn('capitalize text-xs', getSeverityBadge(incident.severity))}>
                          {incident.severity}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {getServiceName(incident.service_id)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white">{incident.title}</h3>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
