'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TaskForm } from '@/components/TaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITask } from '@/models/Task';

interface EditTaskClientProps {
  id: string;
}

export default function EditTaskClient({ id }: EditTaskClientProps) {
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

  const handleSubmit = async (data: Partial<ITask>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
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
          <CardTitle>Edit Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            task={task}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
} 