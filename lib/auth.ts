import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongoose';
import { User, IUser } from '@/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_EMAILS = ['filatei@gtsng.com', 'filatei@gmail.com', 'filatei@torama.ng'];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email });
                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                // Set admin role for specific email addresses
                const isAdmin = ADMIN_EMAILS.includes(credentials.email);
                if (isAdmin && user.role !== 'admin') {
                    user.role = 'admin';
                    await user.save();
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: isAdmin ? 'admin' : user.role,
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'user' | 'admin';
            }
            return session;
        }
    }
}; 