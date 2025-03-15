"use client";

import { useState } from 'react';
import { IUser } from '@/models/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface NotificationFormProps {
    users: IUser[];
}

export function NotificationForm({ users }: NotificationFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'all' as 'all' | 'selected',
        selectedUsers: [] as string[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to send notification');
            }

            toast({
                title: 'Success',
                description: 'Notification sent successfully',
            });

            // Reset form
            setFormData({
                title: '',
                message: '',
                type: 'all',
                selectedUsers: [],
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            toast({
                title: 'Error',
                description: 'Failed to send notification',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Send To</Label>
                <Select
                    value={formData.type}
                    onValueChange={(value: 'all' | 'selected') => 
                        setFormData({ ...formData, type: value, selectedUsers: [] })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="selected">Selected Users</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.type === 'selected' && (
                <div className="space-y-2">
                    <Label>Select Users</Label>
                    <Select
                        value={formData.selectedUsers[0] || ''}
                        onValueChange={(value) => {
                            if (!formData.selectedUsers.includes(value)) {
                                setFormData({
                                    ...formData,
                                    selectedUsers: [...formData.selectedUsers, value],
                                });
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select users" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user._id.toString()} value={user._id.toString()}>
                                    {user.name} ({user.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {formData.selectedUsers.length > 0 && (
                        <div className="mt-2">
                            <Label>Selected Users:</Label>
                            <ul className="mt-1 space-y-1">
                                {formData.selectedUsers.map((userId) => {
                                    const user = users.find(u => u._id.toString() === userId);
                                    return (
                                        <li key={userId} className="flex items-center justify-between">
                                            <span>{user?.name} ({user?.email})</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        selectedUsers: formData.selectedUsers.filter(id => id !== userId),
                                                    });
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
            </Button>
        </form>
    );
} 