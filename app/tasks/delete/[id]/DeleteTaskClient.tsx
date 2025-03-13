'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ITask } from '@/models/Task';

interface DeleteTaskClientProps {
  id: string;
}

export default function DeleteTaskClient({ id }: DeleteTaskClientProps) {
  const router = useRouter();
  const [task, setTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Delete Task</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            Are you sure you want to delete the task &ldquo;{task.title}&rdquo;?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Task
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 