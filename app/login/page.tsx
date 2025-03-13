'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Choose your preferred sign in method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <FaGoogle />
            Continue with Google
          </Button>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          >
            <FaGithub />
            Continue with GitHub
          </Button>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
          >
            <FaFacebook />
            Continue with Facebook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 