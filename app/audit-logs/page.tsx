'use client';

import { useState, useEffect } from 'react';
import { AuditLog, Snapshot } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Database, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { createSnapshot, restoreSnapshot } from '@/lib/disaster-recovery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [logsRes, snapshotsRes] = await Promise.all([
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('snapshots').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (snapshotsRes.error) throw snapshotsRes.error;

      setLogs(logsRes.data || []);
      setSnapshots(snapshotsRes.data || []);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSnapshot() {
    setCreatingSnapshot(true);
    try {
      const snapshotId = await createSnapshot();
      if (snapshotId) {
        toast.success('System snapshot created successfully');
        await loadData();
      } else {
        toast.error('Failed to create snapshot');
      }
    } finally {
      setCreatingSnapshot(false);
    }
  }

  async function handleRestoreSnapshot(snapshotId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to restore this snapshot? This will replace current tasks and incidents.'
    );

    if (!confirmed) return;

    try {
      const success = await restoreSnapshot(snapshotId);
      if (success) {
        toast.success('System restored from snapshot successfully');
        await loadData();
        setSnapshotDialogOpen(false);
      } else {
        toast.error('Failed to restore snapshot');
      }
    } catch (error) {
      toast.error('Failed to restore snapshot');
      console.error(error);
    }
  }

  const getActionBadge = (action: string) => {
    if (action.includes('created')) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (action.includes('updated') || action.includes('moved')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (action.includes('deleted')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (action.includes('resolved')) return 'bg-green-500/10 text-green-400 border-green-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-sm text-gray-400">
              Complete system activity tracking and disaster recovery
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSnapshotDialogOpen(true)}
            >
              <Database className="mr-2 h-4 w-4" />
              View Snapshots
            </Button>
            <Button onClick={handleCreateSnapshot} disabled={creatingSnapshot}>
              <Shield className="mr-2 h-4 w-4" />
              {creatingSnapshot ? 'Creating...' : 'Create Snapshot'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-2">
          {logs.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900 p-8 text-center">
              <ScrollText className="mx-auto mb-2 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">No audit logs yet</p>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id} className="border-gray-800 bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getActionBadge(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                    <span className="text-sm text-gray-400 capitalize">
                      {log.entity_type}
                    </span>
                    {log.metadata.title && (
                      <span className="text-sm text-white">
                        {log.metadata.title}
                      </span>
                    )}
                    {log.metadata.from && log.metadata.to && (
                      <span className="text-sm text-gray-400">
                        {log.metadata.from} → {log.metadata.to}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={snapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>System Snapshots</DialogTitle>
            <DialogDescription>
              Restore your system state from a previous snapshot
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {snapshots.length === 0 ? (
              <p className="py-8 text-center text-gray-400">No snapshots available</p>
            ) : (
              snapshots.map((snapshot) => (
                <Card key={snapshot.id} className="border-gray-800 bg-gray-900 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        {new Date(snapshot.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {snapshot.snapshot_data.tasks?.length || 0} tasks,{' '}
                        {snapshot.snapshot_data.services?.length || 0} services,{' '}
                        {snapshot.snapshot_data.incidents?.length || 0} incidents
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRestoreSnapshot(snapshot.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
