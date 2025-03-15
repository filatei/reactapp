import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { SessionProvider } from 'next-auth/react';

/* eslint-disable @typescript-eslint/no-unused-vars */
class MockEventSource implements EventSource {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSED = 2;

    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSED = 2;

    readyState: number = MockEventSource.CONNECTING;
    url: string;
    withCredentials: boolean;
    onopen: ((this: EventSource, ev: Event) => void) | null = null;
    onmessage: ((this: EventSource, ev: MessageEvent<unknown>) => void) | null = null;
    onerror: ((this: EventSource, ev: Event) => void) | null = null;

    constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
        this.url = url.toString();
        this.withCredentials = eventSourceInitDict?.withCredentials ?? false;
    }

    close(): void {
        this.readyState = MockEventSource.CLOSED;
    }

    addEventListener<K extends keyof EventSourceEventMap>(type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void {
        // Implementation not needed for our tests
    }

    removeEventListener<K extends keyof EventSourceEventMap>(type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => void, options?: boolean | EventListenerOptions): void {
        // Implementation not needed for our tests
    }

    dispatchEvent(event: Event): boolean {
        return true;
    }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

// Mock Request and Response
class MockRequest implements Request {
    readonly cache: RequestCache = 'default';
    readonly credentials: RequestCredentials = 'same-origin';
    readonly destination: RequestDestination = 'document';
    readonly headers: Headers = new Headers();
    readonly integrity: string = '';
    readonly keepalive: boolean = false;
    readonly method: string;
    readonly mode: RequestMode = 'cors';
    readonly redirect: RequestRedirect = 'follow';
    readonly referrer: string = 'about:client';
    readonly referrerPolicy: ReferrerPolicy = 'no-referrer';
    readonly signal: AbortSignal = new AbortController().signal;
    readonly url: string;
    readonly body: ReadableStream | null = null;
    readonly bodyUsed: boolean = false;

    constructor(input: string | URL | Request, init: RequestInit = {}) {
        this.url = input.toString();
        this.method = init.method || 'GET';
    }

    bytes(): Promise<Uint8Array> { return Promise.resolve(new Uint8Array()); }
    arrayBuffer(): Promise<ArrayBuffer> { return Promise.resolve(new ArrayBuffer(0)); }
    blob(): Promise<Blob> { return Promise.resolve(new Blob()); }
    formData(): Promise<FormData> { return Promise.resolve(new FormData()); }
    json(): Promise<unknown> { return Promise.resolve({}); }
    text(): Promise<string> { return Promise.resolve(''); }
    clone(): Request { return new MockRequest(this.url); }
}

class MockResponse implements Response {
    readonly headers: Headers = new Headers();
    readonly ok: boolean = true;
    readonly redirected: boolean = false;
    readonly status: number = 200;
    readonly statusText: string = 'OK';
    readonly type: ResponseType = 'default';
    readonly url: string = '';
    readonly body: ReadableStream | null = null;
    readonly bodyUsed: boolean = false;
    private readonly responseBody: string | null;

    constructor(body?: BodyInit | null, init: ResponseInit = {}) {
        this.responseBody = body ? String(body) : null;
        this.status = init.status || 200;
        this.statusText = init.statusText || 'OK';
        if (init.headers) {
            this.headers = new Headers(init.headers);
        }
    }

    bytes(): Promise<Uint8Array> { return Promise.resolve(new Uint8Array()); }
    arrayBuffer(): Promise<ArrayBuffer> { return Promise.resolve(new ArrayBuffer(0)); }
    blob(): Promise<Blob> { return Promise.resolve(new Blob()); }
    formData(): Promise<FormData> { return Promise.resolve(new FormData()); }
    json(): Promise<unknown> { return Promise.resolve(this.responseBody ? JSON.parse(this.responseBody) : null); }
    text(): Promise<string> { return Promise.resolve(this.responseBody || ''); }
    clone(): Response { return new MockResponse(this.responseBody); }
}

// Set up global mocks
Object.defineProperty(global, 'TextEncoder', { value: TextEncoder });
Object.defineProperty(global, 'TextDecoder', { value: TextDecoder });
Object.defineProperty(global, 'EventSource', { value: MockEventSource });
Object.defineProperty(global, 'Request', { value: MockRequest });
Object.defineProperty(global, 'Response', { value: MockResponse });

// Mock console methods to avoid noise in test output
global.console = {
    ...console,
    // Uncomment to suppress specific console methods during tests
    // log: jest.fn(),
    // error: jest.fn(),
    // warn: jest.fn(),
};

// Mock next-auth
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(() => ({
        data: {
            user: {
                email: 'test@example.com',
                name: 'Test User',
                role: 'ADMIN'
            }
        },
        status: 'authenticated'
    })),
    SessionProvider: ({ children }: { children: React.ReactNode }) => {
        return children;
    }
}));

// Mock @/components/ui/use-toast
jest.mock('@/components/ui/use-toast', () => ({
    useToast: jest.fn(() => ({
        toast: jest.fn()
    }))
}));

// Mock User model
jest.mock('@/models/User', () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Suppress console.error and console.warn in tests
console.error = jest.fn();
console.warn = jest.fn();

// Mock EventSource
export class MockEventSource {
    private listeners: { [key: string]: ((event: MessageEvent | Event) => void)[] } = {};
    private readyState: number = 0;
    public url: string;
    public withCredentials: boolean;

    constructor(url: string, options?: { withCredentials?: boolean }) {
        this.url = url;
        this.withCredentials = options?.withCredentials || false;
    }

    addEventListener(type: string, listener: (event: MessageEvent | Event) => void) {
        if (!this.listeners[type]) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(listener);
    }

    removeEventListener(type: string, listener: (event: MessageEvent | Event) => void) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(l => l !== listener);
        }
    }

    close() {
        this.readyState = 2;
    }

    // Helper methods for testing
    _emit(type: string, data: unknown) {
        if (this.listeners[type]) {
            const event = new MessageEvent(type, { data: JSON.stringify(data) });
            this.listeners[type].forEach(listener => listener(event));
        }
    }

    _triggerError() {
        if (this.listeners['error']) {
            const event = new Event('error');
            this.listeners['error'].forEach(listener => listener(event));
        }
    }
}

// @ts-expect-error - Overriding global EventSource for testing
global.EventSource = jest.fn().mockImplementation((url: string, options?: { withCredentials?: boolean }) => {
    return new MockEventSource(url, options);
});

// Mock fetch
global.fetch = jest.fn();

// Suppress console errors and warnings during tests
console.error = jest.fn();
console.warn = jest.fn(); 