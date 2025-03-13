"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileData {
    name?: string;
    email?: string;
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}

interface ProfileFormProps {
    initialData?: ProfileData;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await fetch('/api/user/profile');
            if (!response.ok) throw new Error('Failed to fetch profile');
            return response.json();
        },
        initialData,
    });

    const { mutate: updateProfile, isPending: isUpdating } = useMutation({
        mutationFn: async (data: ProfileData) => {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
        },
    });

    if (isLoading) {
        return <div>Loading profile...</div>;
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateProfile({
                    name: formData.get('name')?.toString(),
                    phoneNumber: formData.get('phoneNumber')?.toString(),
                    address: {
                        street: formData.get('street')?.toString(),
                        city: formData.get('city')?.toString(),
                        state: formData.get('state')?.toString(),
                        zipCode: formData.get('zipCode')?.toString(),
                        country: formData.get('country')?.toString(),
                    },
                });
            }}
            className="space-y-4"
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={profile?.name}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={profile?.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                </label>
                <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    defaultValue={profile?.phoneNumber}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                />
            </div>

            <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Street Address
                </label>
                <input
                    type="text"
                    name="street"
                    id="street"
                    defaultValue={profile?.address?.street}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                    </label>
                    <input
                        type="text"
                        name="city"
                        id="city"
                        defaultValue={profile?.address?.city}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                    </label>
                    <input
                        type="text"
                        name="state"
                        id="state"
                        defaultValue={profile?.address?.state}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                    </label>
                    <input
                        type="text"
                        name="zipCode"
                        id="zipCode"
                        defaultValue={profile?.address?.zipCode}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                    </label>
                    <input
                        type="text"
                        name="country"
                        id="country"
                        defaultValue={profile?.address?.country}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                {isEditing ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </form>
    );
} 