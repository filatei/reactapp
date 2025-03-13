import { useState, useEffect } from 'react';
import { ITask } from '@/models/Task';

export function useTasks() {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData: Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            const newTask = await response.json();
            setTasks((prev) => [...prev, newTask]);
            return newTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const updateTask = async (id: string, taskData: Partial<ITask>) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            setTasks((prev) =>
                prev.map((task) => (task._id.toString() === id ? updatedTask : task))
            );
            return updatedTask;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            setTasks((prev) => prev.filter((task) => task._id.toString() !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return {
        tasks,
        loading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refreshTasks: fetchTasks,
    };
} 