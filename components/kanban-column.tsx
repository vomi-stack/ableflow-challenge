'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDrop: (taskId: string, status: TaskStatus) => void;
}

export function KanbanColumn({
  title,
  status,
  tasks,
  onTaskEdit,
  onAddTask,
  onDrop,
}: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, status);
    }
  };

  const statusColors = {
    backlog: 'border-gray-700',
    todo: 'border-blue-700',
    in_progress: 'border-yellow-700',
    done: 'border-green-700',
  };

  return (
    <div
      className={cn(
        'flex min-w-[320px] flex-col rounded-lg border-t-4 bg-gray-900 p-4',
        statusColors[status],
        dragOver && 'bg-gray-800'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{tasks.length} tasks</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddTask(status)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskEdit(task)}
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
              setDraggedTaskId(task.id);
            }}
            onDragEnd={() => setDraggedTaskId(null)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-800">
            <p className="text-sm text-gray-500">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
