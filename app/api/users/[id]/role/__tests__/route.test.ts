import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { PUT } from '../route';
import { User } from '@/models/User';
import { Types } from 'mongoose';
import { sendUpdate } from '@/lib/sse';

// Mock dependencies
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn().mockImplementation((data, init) => ({
            json: async () => data,
            status: init?.status || 200,
        })),
    },
}));

jest.mock('next-auth', () => ({
    getServerSession: jest.fn(),
}));

jest.mock('@/models/User', () => ({
    User: {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOne: jest.fn(),
    },
}));

jest.mock('@/lib/mongoose', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@/lib/sse', () => ({
    sendUpdate: jest.fn(),
}));

describe('PUT /api/users/[id]/role', () => {
    const mockUserId = new Types.ObjectId();
    const mockAdminEmail = 'admin@example.com';
    const mockUserEmail = 'user@example.com';

    const mockUser = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
        provider: 'google',
        providerId: 'test123',
        address: '123 Test St',
        phoneNumber: '1234567890',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        save: jest.fn()
    };

    const mockAdminUser = {
        _id: 'admin1',
        email: 'admin@example.com',
        role: 'ADMIN'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { email: mockAdminUser.email }
        });
        (User.findById as jest.Mock).mockImplementation((id) => {
            if (id === mockUser._id) {
                return Promise.resolve(mockUser);
            } else if (id === mockAdminUser._id) {
                return Promise.resolve(mockAdminUser);
            }
            return Promise.resolve(null);
        });
        (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should return 401 if user is not authenticated', async () => {
        (getServerSession as jest.Mock).mockResolvedValue(null);

        const response = await PUT(
            new Request('http://localhost/api/users/123/role', {
                method: 'PUT',
                body: JSON.stringify({ role: 'user' }),
            }),
            { params: { id: '123' } }
        );

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Not authenticated' });
    });

    it('should return 403 if user is not an admin', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
            user: {
                email: mockUserEmail,
            },
        });

        (User.findOne as jest.Mock).mockResolvedValue({
            role: 'user',
        });

        const response = await PUT(
            new Request('http://localhost/api/users/123/role', {
                method: 'PUT',
                body: JSON.stringify({ role: 'user' }),
            }),
            { params: { id: '123' } }
        );

        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data).toEqual({ error: 'Not authorized' });
    });

    it('should return 400 if user ID is invalid', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
            user: {
                email: mockAdminEmail,
            },
        });

        (User.findOne as jest.Mock).mockResolvedValue({
            role: 'admin',
        });

        const response = await PUT(
            new Request('http://localhost/api/users/invalid-id/role', {
                method: 'PUT',
                body: JSON.stringify({ role: 'admin' }),
            }),
            { params: { id: 'invalid-id' } }
        );

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Invalid user ID' });
    });

    it('should return 400 if role is invalid', async () => {
        (getServerSession as jest.Mock).mockResolvedValue({
            user: {
                email: mockAdminEmail,
            },
        });

        (User.findOne as jest.Mock).mockResolvedValue({
            role: 'admin',
        });

        const response = await PUT(
            new Request('http://localhost/api/users/123456789012345678901234/role', {
                method: 'PUT',
                body: JSON.stringify({ role: 'invalid_role' }),
            }),
            { params: { id: '123456789012345678901234' } }
        );

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Invalid role' });
    });

    it('should update user role successfully', async () => {
        const request = new NextRequest('http://localhost:3000/api/users/user1/role', {
            method: 'PUT',
            body: JSON.stringify({ role: 'ADMIN' })
        });

        const response = await PUT(request, { params: { id: mockUser._id } });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({
            ...mockUser,
            role: 'ADMIN',
            _id: mockUser._id.toString(),
            createdAt: mockUser.createdAt.toISOString(),
            updatedAt: mockUser.updatedAt.toISOString()
        });
        expect(sendUpdate).toHaveBeenCalledWith({
            type: 'USER_UPDATED',
            userId: mockUser._id,
            updates: { role: 'ADMIN' }
        });
    });

    it('should return 404 if user is not found', async () => {
        const request = new NextRequest('http://localhost:3000/api/users/nonexistent/role', {
            method: 'PUT',
            body: JSON.stringify({ role: 'ADMIN' })
        });

        const response = await PUT(request, { params: { id: 'nonexistent' } });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data).toEqual({ error: 'User not found' });
    });

    it('should handle errors gracefully', async () => {
        (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

        const request = new NextRequest('http://localhost:3000/api/users/user1/role', {
            method: 'PUT',
            body: JSON.stringify({ role: 'ADMIN' })
        });

        const response = await PUT(request, { params: { id: mockUser._id } });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Database error' });
    });
}); 