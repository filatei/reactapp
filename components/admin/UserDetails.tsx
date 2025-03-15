"use client";

import { IUser } from '@/models/User';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/page-transition';

interface UserDetailsProps {
    user: IUser;
}

export function UserDetails({ user }: UserDetailsProps) {
    return (
        <PageTransition>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Users
                    </Button>
                </Link>
            </div>

            <div className="bg-card shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-foreground">Basic Information</h2>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                <dd className="mt-1 text-foreground">{user.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                <dd className="mt-1 text-foreground">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                                <dd className="mt-1 text-foreground capitalize">{user.role}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Phone Number</dt>
                                <dd className="mt-1 text-foreground">{user.phoneNumber || 'Not provided'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-foreground">Address</h2>
                        {user.address ? (
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Street</dt>
                                    <dd className="mt-1 text-foreground">{user.address.street}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">City</dt>
                                    <dd className="mt-1 text-foreground">{user.address.city}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">State</dt>
                                    <dd className="mt-1 text-foreground">{user.address.state}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">ZIP Code</dt>
                                    <dd className="mt-1 text-foreground">{user.address.zipCode}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                                    <dd className="mt-1 text-foreground">{user.address.country}</dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="text-muted-foreground">No address provided</p>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
} 