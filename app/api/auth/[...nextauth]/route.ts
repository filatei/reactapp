// import NextAuth, { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import GithubProvider from "next-auth/providers/github";
// import EmailProvider from "next-auth/providers/email";
// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import clientPromise from "@/lib/mongodb";
// import { Adapter } from "next-auth/adapters";

// export const authOptions: NextAuthOptions = {
//     adapter: MongoDBAdapter(clientPromise) as Adapter,
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//         GithubProvider({
//             clientId: process.env.GITHUB_ID!,
//             clientSecret: process.env.GITHUB_SECRET!,
//         }),
//         EmailProvider({
//             server: {
//                 host: process.env.EMAIL_SERVER_HOST,
//                 port: Number(process.env.EMAIL_SERVER_PORT),
//                 auth: {
//                     user: process.env.EMAIL_SERVER_USER,
//                     pass: process.env.EMAIL_SERVER_PASSWORD,
//                 },
//             },
//             from: process.env.EMAIL_FROM,
//         }),
//     ],
//     pages: {
//         signIn: '/auth/signin',
//         error: '/auth/error',
//         verifyRequest: '/auth/verify',
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//     session: {
//         strategy: 'jwt',
//     },
//     callbacks: {
//         async session({ session, token }) {
//             if (session?.user) {
//                 session.user.id = token.sub!;
//             }
//             return session;
//         }
//     },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST }; 

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
        signIn: "/login",
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
                    });
                }

                return true;
            } catch (error) {
                console.error("Error during signIn callback:", error);
                return false;
            }
        },
        async redirect({ baseUrl }) {
            return baseUrl + "/dashboard";
        },
    },
});

export { handler as GET, handler as POST };