import 'next-auth';
import { Types } from 'mongoose';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        name?: string;
        role?: 'user' | 'admin' | 'estate_admin';
        estate?: string;
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            role?: 'user' | 'admin' | 'estate_admin';
            estate?: string;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role?: string;
    }
} 