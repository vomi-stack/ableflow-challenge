'use client';

import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export function TaskCard({ task, onClick, onDragStart, onDragEnd }: TaskCardProps) {
  const priorityColors = {
    low: 'border-l-green-500 bg-green-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    high: 'border-l-red-500 bg-red-500/5',
  };

  const priorityBadgeColors = {
    low: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'cursor-pointer border-l-4 p-4 transition-all hover:shadow-lg',
        priorityColors[task.priority],
        'border border-gray-800 bg-gray-900'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-white">{task.title}</h3>
          {task.priority === 'high' && (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
        </div>
        {task.description && (
          <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-xs', priorityBadgeColors[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-gray-800 text-gray-300 border-gray-700"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-gray-800 text-gray-300 border-gray-700"
                >
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="mr-1 h-3 w-3" />
          {new Date(task.updated_at).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
