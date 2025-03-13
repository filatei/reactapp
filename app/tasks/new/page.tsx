'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITask } from '@/models/Task';

export default function NewTask() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<ITask>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  );
} 