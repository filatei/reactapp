"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteTaskClientProps {
    id: string;
}

export function DeleteTaskClient({ id }: DeleteTaskClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState(false);

    const { mutate: deleteTask } = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            router.push('/tasks');
        },
        onError: (error) => {
            console.error('Error deleting task:', error);
            setIsDeleting(false);
        },
    });

    const handleDelete = () => {
        setIsDeleting(true);
        deleteTask();
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Delete Task</h1>
            <div className="bg-white shadow rounded-lg p-6">
                <p className="text-gray-700 mb-6">
                    Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => router.push('/tasks')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Task'}
                    </button>
                </div>
            </div>
        </div>
    );
} 