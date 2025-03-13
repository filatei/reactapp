import { UserProfile } from '@/types/user';

export const profileApi = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        return response.json();
    },

    updateProfile: async (data: UserProfile): Promise<UserProfile> => {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }
        return response.json();
    },
}; 