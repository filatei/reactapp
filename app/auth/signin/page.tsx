'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('email', { email, redirect: false });
    if (result?.ok) {
      setIsEmailSent(true);
    }
  };

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>A sign in link has been sent to your email address.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Choose your preferred sign in method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              <FaGoogle />
              Continue with Google
            </Button>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn('github', { callbackUrl: '/' })}
            >
              <FaGithub />
              Continue with GitHub
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign in with Email
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 