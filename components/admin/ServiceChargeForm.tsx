"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ServiceChargeFormData {
    title: string;
    description: string;
    amount: number;
    type: 'annual' | 'incidental';
    category: 'maintenance' | 'repairs' | 'utilities' | 'security' | 'other';
    dueDate?: string;
}

export function ServiceChargeForm() {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ServiceChargeFormData>({
        title: '',
        description: '',
        amount: 0,
        type: 'incidental',
        category: 'maintenance',
        dueDate: '',
    });

    const { mutate: createServiceCharge } = useMutation({
        mutationFn: async (data: ServiceChargeFormData) => {
            const response = await fetch('/api/service-charges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to create service charge');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['serviceCharges'] });
            setFormData({
                title: '',
                description: '',
                amount: 0,
                type: 'incidental',
                category: 'maintenance',
                dueDate: '',
            });
            setIsSubmitting(false);
        },
        onError: (error) => {
            console.error('Error creating service charge:', error);
            setIsSubmitting(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        createServiceCharge(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                </label>
                <input
                    type="number"
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                </label>
                <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'annual' | 'incidental' })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="annual">Annual</option>
                    <option value="incidental">Incidental</option>
                </select>
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                </label>
                <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceChargeFormData['category'] })}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="maintenance">Maintenance</option>
                    <option value="repairs">Repairs</option>
                    <option value="utilities">Utilities</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {formData.type === 'annual' && (
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {isSubmitting ? 'Creating...' : 'Create Service Charge'}
            </button>
        </form>
    );
} 