'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { KanbanColumn } from '@/components/kanban-column';
import { TaskDialog } from '@/components/task-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createAuditLog } from '@/lib/audit';
import { aiPrioritizeTasks, generateAIPriorityReason } from '@/lib/ai-prioritizer';

const columns: { title: string; status: TaskStatus }[] = [
  { title: 'Backlog', status: 'backlog' },
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in_progress' },
  { title: 'Done', status: 'done' },
];

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTask(taskData: Partial<Task>) {
    try {
      if (taskData.id) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status: taskData.status,
            tags: taskData.tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskData.id);

        if (error) throw error;

        await createAuditLog('task_updated', 'task', taskData.id!, {
          title: taskData.title,
          status: taskData.status,
        });

        toast.success('Task updated successfully');
      } else {
        const { error } = await supabase.from('tasks').insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          tags: taskData.tags,
          position: tasks.filter((t) => t.status === taskData.status).length,
        });

        if (error) throw error;

        await createAuditLog('task_created', 'task', null, {
          title: taskData.title,
          status: taskData.status,
        });

        toast.success('Task created successfully');
      }

      await loadTasks();
    } catch (error) {
      toast.error('Failed to save task');
      console.error(error);
    }
  }

  async function handleTaskDrop(taskId: string, newStatus: TaskStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      await createAuditLog('task_moved', 'task', taskId, {
        from: task.status,
        to: newStatus,
        title: task.title,
      });

      toast.success('Task moved successfully');
      await loadTasks();
    } catch (error) {
      toast.error('Failed to move task');
      console.error(error);
    }
  }

  function handleAddTask(status: TaskStatus) {
    setEditingTask(undefined);
    setDefaultStatus(status);
    setDialogOpen(true);
  }

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function handleAIPrioritize(
    title: string,
    description: string
  ): Promise<Priority> {
    const priority = aiPrioritizeTasks(title, description);
    const reason = generateAIPriorityReason(priority, `${title} ${description}`);
    toast.success(reason, { duration: 5000 });
    return priority;
  }

  const tasksByStatus = columns.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.status),
  }));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-gray-800 bg-gray-900 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Board</h1>
            <p className="text-sm text-gray-400">
              Manage tasks with AI-powered prioritization
            </p>
          </div>
          <Button onClick={() => handleAddTask('backlog')}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto p-8">
        {tasksByStatus.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={column.tasks}
            onTaskEdit={handleEditTask}
            onAddTask={handleAddTask}
            onDrop={handleTaskDrop}
          />
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        defaultStatus={defaultStatus}
        onAIPrioritize={handleAIPrioritize}
      />
    </div>
  );
}
