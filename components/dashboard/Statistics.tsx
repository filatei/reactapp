'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  priorities: {
    high: number;
    medium: number;
    low: number;
  };
  upcomingDeadlines: number;
}

export function Statistics() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/tasks/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
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

  if (!stats) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No statistics available
      </div>
    );
  }

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Completion Rate */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completion Rate</span>
          <span className="font-medium">{completionRate}%</span>
        </div>
        <Progress value={completionRate} />
      </div>

      {/* Task Distribution */}
      <div className="space-y-2">
        <span className="text-sm">Task Distribution</span>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-2">
            <div className="font-medium text-green-600 dark:text-green-400">{stats.completed}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-2">
            <div className="font-medium text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-900/20 p-2">
            <div className="font-medium text-gray-600 dark:text-gray-400">{stats.todo}</div>
            <div className="text-muted-foreground">Todo</div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="space-y-2">
        <span className="text-sm">Priority Distribution</span>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-red-100 dark:bg-red-900/20 p-2">
            <div className="font-medium text-red-600 dark:text-red-400">{stats.priorities.high}</div>
            <div className="text-muted-foreground">High</div>
          </div>
          <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-2">
            <div className="font-medium text-yellow-600 dark:text-yellow-400">{stats.priorities.medium}</div>
            <div className="text-muted-foreground">Medium</div>
          </div>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-900/20 p-2">
            <div className="font-medium text-gray-600 dark:text-gray-400">{stats.priorities.low}</div>
            <div className="text-muted-foreground">Low</div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-3 text-center">
        <div className="font-medium text-orange-600 dark:text-orange-400 text-2xl">
          {stats.upcomingDeadlines}
        </div>
        <div className="text-sm text-muted-foreground">
          Tasks due in the next 7 days
        </div>
      </div>
    </div>
  );
} 