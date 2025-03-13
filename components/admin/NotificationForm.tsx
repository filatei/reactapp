"use client";

import { useState } from 'react';
import { IUser } from '@/models/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notification title"
                    required
                />
            </div>

            <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Notification message"
                    required
                />
            </div>

            <div>
                <label className="text-sm font-medium">Send to</label>
                <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as 'all' | 'selected' })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="selected">Selected Users</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {formData.type === 'selected' && (
                <div>
                    <label className="text-sm font-medium">Select Users</label>
                    <Select
                        value={formData.selectedUsers[0]}
                        onValueChange={(value) => setFormData({ ...formData, selectedUsers: [value] })}
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
                </div>
            )}

            <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
            </Button>
        </form>
    );
} 