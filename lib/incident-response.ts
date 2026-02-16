import { Service, Incident } from './types';
import { supabase } from './supabase';
import { createAuditLog } from './audit';

export async function checkServiceHealth(service: Service): Promise<boolean> {
  const isHealthy = service.status === 'operational';
  return isHealthy;
}

export async function triggerIncidentAlert(
  serviceId: string,
  serviceName: string
): Promise<Incident | null> {
  const incident = {
    service_id: serviceId,
    severity: 'critical' as const,
    title: `${serviceName} Service Degradation Detected`,
    description: `AI Incident Response Agent detected that ${serviceName} is experiencing issues. Automated investigation initiated.`,
    status: 'investigating' as const,
  };

  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single();

  if (error) {
    console.error('Failed to create incident:', error);
    return null;
  }

  await createAuditLog(
    'incident_created',
    'incident',
    data.id,
    { service_name: serviceName, severity: 'critical' }
  );

  return data;
}

export function analyzeIncidentPattern(incidents: Incident[]): {
  recurring: boolean;
  affectedServices: string[];
  recommendation: string;
} {
  const serviceIncidentCounts = new Map<string, number>();

  incidents.forEach(incident => {
    const count = serviceIncidentCounts.get(incident.service_id) || 0;
    serviceIncidentCounts.set(incident.service_id, count + 1);
  });

  const recurringServices = Array.from(serviceIncidentCounts.entries())
    .filter(([_, count]) => count > 2)
    .map(([serviceId]) => serviceId);

  return {
    recurring: recurringServices.length > 0,
    affectedServices: recurringServices,
    recommendation: recurringServices.length > 0
      ? 'AI recommends implementing circuit breaker pattern for affected services'
      : 'No recurring patterns detected. Continue monitoring.',
  };
}
