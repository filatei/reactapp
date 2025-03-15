import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import { User } from "@/models/User";
import dbConnect from "@/lib/mongoose";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile",
                },
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                await dbConnect();

                if (!user?.email || !account?.provider) {
                    throw new Error("Missing required fields (email or provider)");
                }

                let dbUser = await User.findOne({ email: user.email });
                if (!dbUser) {
                    dbUser = await User.create({
                        email: user.email,
                        name: user.name,
                        provider: account.provider,
                        providerId: user.id,
                        role: 'user', // Set default role
                    });
                }

                // Set admin role for specific email addresses
                const ADMIN_EMAILS = ['filatei@gtsng.com', 'filatei@gmail.com', 'filatei@torama.ng'];
                if (ADMIN_EMAILS.includes(user.email) && dbUser.role !== 'admin') {
                    dbUser.role = 'admin';
                    await dbUser.save();
                }

                return true;
            } catch (error) {
                console.error("Error during signIn callback:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                await dbConnect();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                    token.estate = dbUser.estate?.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'user' | 'admin';
                session.user.estate = token.estate as string | undefined;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Always allow callback URLs
            if (url.startsWith(baseUrl + "/api/auth")) {
                return url;
            }
            // Default to dashboard
            return baseUrl + "/dashboard";
        },
    },
});

export { handler as GET, handler as POST };