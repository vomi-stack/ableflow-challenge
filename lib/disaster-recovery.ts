import { supabase } from './supabase';
import { Task, Service, Incident } from './types';
import { createAuditLog } from './audit';

export async function createSnapshot(): Promise<string | null> {
  try {
    const [tasksRes, servicesRes, incidentsRes] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('services').select('*'),
      supabase.from('incidents').select('*'),
    ]);

    if (tasksRes.error || servicesRes.error || incidentsRes.error) {
      throw new Error('Failed to fetch data for snapshot');
    }

    const snapshotData = {
      tasks: tasksRes.data as Task[],
      services: servicesRes.data as Service[],
      incidents: incidentsRes.data as Incident[],
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('snapshots')
      .insert({ snapshot_data: snapshotData })
      .select()
      .single();

    if (error) throw error;

    await createAuditLog('snapshot_created', 'snapshot', data.id, {
      task_count: tasksRes.data.length,
      service_count: servicesRes.data.length,
      incident_count: incidentsRes.data.length,
    });

    return data.id;
  } catch (error) {
    console.error('Failed to create snapshot:', error);
    return null;
  }
}

export async function restoreSnapshot(snapshotId: string): Promise<boolean> {
  try {
    const { data: snapshot, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single();

    if (error || !snapshot) throw new Error('Snapshot not found');

    const { snapshot_data } = snapshot;

    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (snapshot_data.tasks && snapshot_data.tasks.length > 0) {
      await supabase.from('tasks').insert(
        snapshot_data.tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          status: t.status,
          position: t.position,
          tags: t.tags,
        }))
      );
    }

    if (snapshot_data.services && snapshot_data.services.length > 0) {
      for (const service of snapshot_data.services) {
        await supabase
          .from('services')
          .update({
            status: service.status,
            uptime: service.uptime,
            latency: service.latency,
          })
          .eq('id', service.id);
      }
    }

    if (snapshot_data.incidents && snapshot_data.incidents.length > 0) {
      await supabase.from('incidents').insert(
        snapshot_data.incidents.map((i: any) => ({
          id: i.id,
          service_id: i.service_id,
          severity: i.severity,
          title: i.title,
          description: i.description,
          status: i.status,
          resolved_at: i.resolved_at,
        }))
      );
    }

    await createAuditLog('snapshot_restored', 'snapshot', snapshotId, {
      restored_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Failed to restore snapshot:', error);
    return false;
  }
}
