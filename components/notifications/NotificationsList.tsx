"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'direct' | 'broadcast' | 'system';
    isRead: boolean;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    estate?: {
        _id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface NotificationsListProps {
    notifications: Notification[];
}

export function NotificationsList({ notifications: initialNotifications }: NotificationsListProps) {
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRead: true }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );

            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No notifications</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    You're all caught up! No new notifications.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map((notification) => (
                <Card
                    key={notification._id}
                    className={`p-4 ${
                        !notification.isRead ? 'bg-muted/50' : ''
                    }`}
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium">{notification.title}</h3>
                                {notification.type === 'broadcast' && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        Broadcast
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>From: {notification.sender.name}</span>
                                {notification.estate && (
                                    <>
                                        <span>•</span>
                                        <span>Estate: {notification.estate.name}</span>
                                    </>
                                )}
                                <span>•</span>
                                <span>
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification._id)}
                                className="h-8 w-8"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
} 