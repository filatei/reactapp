import { renderHook, act } from '@testing-library/react';
import { useEstate } from '../useEstate';
import { TestWrapper } from '../../test-utils';

describe('useEstate', () => {
    const mockEstate = {
        _id: 'estate1',
        name: 'Test Estate',
        description: 'Test Description',
        address: '123 Test St',
        status: 'active',
        createdBy: {
            _id: 'user1',
            name: 'Test User',
            email: 'test@example.com'
        },
        members: [],
        estateAdmins: []
    };

    const mockJoinRequest = {
        _id: 'request1',
        estate: mockEstate,
        user: {
            _id: 'user2',
            name: 'Test User 2',
            email: 'test2@example.com'
        },
        status: 'pending'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockReset();
    });

    it('should fetch estates', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([mockEstate])
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            await result.current.fetchEstates();
        });

        expect(result.current.estates).toEqual([mockEstate]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should handle fetch estates error', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            await result.current.fetchEstates();
        });

        expect(result.current.estates).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to fetch estates');
    });

    it('should create estate', async () => {
        const newEstate = {
            name: 'New Estate',
            description: 'New Description',
            address: '456 New St'
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ ...mockEstate, ...newEstate })
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            await result.current.createEstate(newEstate);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/estates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEstate)
        });
    });

    it('should fetch join requests for admin and estate_admin roles', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([mockJoinRequest])
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            await result.current.fetchJoinRequests();
        });

        expect(result.current.joinRequests).toEqual([mockJoinRequest]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should not fetch join requests for non-admin roles', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
            statusText: 'Forbidden'
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            await result.current.fetchJoinRequests();
        });

        expect(result.current.joinRequests).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Failed to fetch join requests');
    });

    it('should add estate member', async () => {
        const estateId = 'estate1';
        const memberId = 'user2';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Member added successfully' })
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            await result.current.addEstateMember(estateId, memberId);
        });

        expect(global.fetch).toHaveBeenCalledWith(`/api/estates/${estateId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: memberId })
        });
    });

    it('should handle add member error', async () => {
        const estateId = 'estate1';
        const memberId = 'user2';

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request'
        });

        const { result } = renderHook(() => useEstate(), {
            wrapper: TestWrapper
        });

        await act(async () => {
            try {
                await result.current.addEstateMember(estateId, memberId);
            } catch (error) {
                expect(error.message).toBe('Failed to add member');
            }
        });
    });
}); 