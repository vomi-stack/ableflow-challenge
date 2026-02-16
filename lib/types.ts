export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type ServiceStatus = 'operational' | 'degraded' | 'down';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  position: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
  latency: number;
  last_check: string;
  endpoint: string;
  created_at: string;
}

export interface Incident {
  id: string;
  service_id: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  status: IncidentStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Snapshot {
  id: string;
  snapshot_data: {
    tasks: Task[];
    services: Service[];
    incidents: Incident[];
    timestamp: string;
  };
  created_at: string;
}
