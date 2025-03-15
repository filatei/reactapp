import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Estate {
    _id: string;
    name: string;
    address: string;
    description?: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    estateAdmins: {
        _id: string;
        name: string;
        email: string;
        role: string;
    }[];
    members: {
        _id: string;
        name: string;
        email: string;
        role: string;
    }[];
    status: 'active' | 'inactive';
}

interface EstateJoinRequest {
    estate: {
        _id: string;
        name: string;
        address: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    updatedAt: string;
}

export function useEstate() {
    const { data: session } = useSession();
    const [estates, setEstates] = useState<Estate[]>([]);
    const [joinRequests, setJoinRequests] = useState<EstateJoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEstates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/estates');
            if (!response.ok) {
                throw new Error('Failed to fetch estates');
            }
            const data = await response.json();
            setEstates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchJoinRequests = async () => {
        try {
            const response = await fetch('/api/estates/join-requests');
            if (!response.ok) {
                throw new Error('Failed to fetch join requests');
            }
            const data = await response.json();
            setJoinRequests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const createEstate = async (estateData: { name: string; address: string; description?: string }) => {
        try {
            const response = await fetch('/api/estates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(estateData),
            });

            if (!response.ok) {
                throw new Error('Failed to create estate');
            }

            const newEstate = await response.json();
            setEstates(prev => [...prev, newEstate]);
            return newEstate;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const requestToJoinEstate = async (estateId: string) => {
        try {
            const response = await fetch('/api/estates/join-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estateId }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit join request');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const handleJoinRequest = async (userId: string, estateId: string, status: 'approved' | 'rejected') => {
        try {
            const response = await fetch('/api/estates/join-requests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, estateId, status }),
            });

            if (!response.ok) {
                throw new Error('Failed to update join request');
            }

            // Refresh estates and join requests
            await Promise.all([fetchEstates(), fetchJoinRequests()]);
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const addEstateMember = async (estateId: string, userId: string, role: 'user' | 'estate_admin') => {
        try {
            const response = await fetch(`/api/estates/${estateId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role }),
            });

            if (!response.ok) {
                throw new Error('Failed to add estate member');
            }

            const updatedEstate = await response.json();
            setEstates(prev => prev.map(estate =>
                estate._id === estateId ? updatedEstate : estate
            ));
            return updatedEstate;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const removeEstateMember = async (estateId: string, userId: string) => {
        try {
            const response = await fetch(`/api/estates/${estateId}/members?userId=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove estate member');
            }

            const updatedEstate = await response.json();
            setEstates(prev => prev.map(estate =>
                estate._id === estateId ? updatedEstate : estate
            ));
            return updatedEstate;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    useEffect(() => {
        if (session?.user) {
            fetchEstates();
            if (session.user.role === 'admin' || session.user.role === 'estate_admin') {
                fetchJoinRequests();
            }
        }
    }, [session]);

    return {
        estates,
        joinRequests,
        loading,
        error,
        createEstate,
        requestToJoinEstate,
        handleJoinRequest,
        addEstateMember,
        removeEstateMember,
        fetchEstates,
        fetchJoinRequests,
        refreshEstates: fetchEstates,
        refreshJoinRequests: fetchJoinRequests,
    };
} 