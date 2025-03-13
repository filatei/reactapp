'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  _id: string;
  type: 'created' | 'updated' | 'completed';
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  createdAt: string;
}

const activityIcons = {
  created: '➕',
  updated: '✏️',
  completed: '✅'
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
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

  if (activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No recent activity
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-start gap-3 text-sm"
          >
            <div className="text-lg">{activityIcons[activity.type]}</div>
            <div className="flex-1 space-y-1">
              <p>
                <span className="font-medium">{activity.userName}</span>
                {' '}
                {activity.type === 'created' && 'created'}
                {activity.type === 'updated' && 'updated'}
                {activity.type === 'completed' && 'completed'}
                {' '}
                <span className="font-medium">&ldquo;{activity.taskTitle}&ldquo;</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 