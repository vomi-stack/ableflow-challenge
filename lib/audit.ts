import { supabase } from './supabase';

export async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
