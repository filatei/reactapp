import { renderHook, act } from '@testing-library/react';
import { useRealtimeUpdates } from '../useRealtimeUpdates';
import { TestWrapper } from '../../test-utils';
import { MockEventSource } from '../../jest.setup';

declare const EventSource: jest.Mock;

describe('useRealtimeUpdates', () => {
    let eventSource: MockEventSource;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create EventSource with correct URL and credentials', () => {
        renderHook(() => useRealtimeUpdates(() => {}), {
            wrapper: TestWrapper
        });

        expect(EventSource).toHaveBeenCalledWith('/api/events', { withCredentials: true });
    });

    it('should add message and error event listeners', () => {
        renderHook(() => useRealtimeUpdates(() => {}), {
            wrapper: TestWrapper
        });

        eventSource = EventSource.mock.results[0].value;
        expect(eventSource.listeners['message']).toBeDefined();
        expect(eventSource.listeners['error']).toBeDefined();
    });

    it('should handle message events', () => {
        const onUpdate = jest.fn();
        renderHook(() => useRealtimeUpdates(onUpdate), {
            wrapper: TestWrapper
        });

        eventSource = EventSource.mock.results[0].value;
        const testData = { type: 'USER_UPDATED', userId: '123', updates: { name: 'Test' } };
        
        act(() => {
            eventSource._emit('message', testData);
        });

        expect(onUpdate).toHaveBeenCalledWith(testData);
    });

    it('should handle error events', () => {
        const { result } = renderHook(() => useRealtimeUpdates(() => {}), {
            wrapper: TestWrapper
        });

        eventSource = EventSource.mock.results[0].value;
        
        act(() => {
            eventSource._triggerError();
        });

        // The hook should set an error state
        expect(result.current).toHaveProperty('error');
        expect(result.current.error).toBeTruthy();
    });

    it('should close EventSource on unmount', () => {
        const { unmount } = renderHook(() => useRealtimeUpdates(() => {}), {
            wrapper: TestWrapper
        });

        eventSource = EventSource.mock.results[0].value;
        const closeSpy = jest.spyOn(eventSource, 'close');

        unmount();

        expect(closeSpy).toHaveBeenCalled();
    });

    it('should remove event listeners on unmount', () => {
        const { unmount } = renderHook(() => useRealtimeUpdates(() => {}), {
            wrapper: TestWrapper
        });

        eventSource = EventSource.mock.results[0].value;
        const removeEventListenerSpy = jest.spyOn(eventSource, 'removeEventListener');

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledTimes(2); // message and error listeners
    });
}); 