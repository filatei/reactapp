'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ITask } from '@/models/Task';

const statusColors = {
  'todo': 'bg-slate-500',
  'in-progress': 'bg-blue-500',
  'done': 'bg-green-500'
} as const;

const priorityColors = {
  'low': 'bg-slate-200 text-slate-700',
  'medium': 'bg-yellow-200 text-yellow-700',
  'high': 'bg-red-200 text-red-700'
} as const;

export function TaskList() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No tasks yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task._id.toString()}
            className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="space-y-1">
              <p className="font-medium">{task.title}</p>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className="text-muted-foreground">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${statusColors[task.status]}`} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 