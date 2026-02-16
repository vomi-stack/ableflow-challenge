import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['backlog', 'todo', 'in_progress', 'done']),
  position: z.number().int().min(0),
  tags: z.array(z.string()),
});

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['operational', 'degraded', 'down']),
  uptime: z.number().min(0).max(100),
  latency: z.number().int().min(0),
  endpoint: z.string().optional(),
});

export const incidentSchema = z.object({
  id: z.string().uuid().optional(),
  service_id: z.string().uuid(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.enum(['open', 'investigating', 'resolved']),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
