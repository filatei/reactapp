import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddEstateUserFormProps {
    estateId: string;
    estateName: string;
}

export function AddEstateUserForm({ estateId, estateName }: AddEstateUserFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'member' | 'admin'>('member');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await fetch(`/api/estates/${estateId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, role }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add user');
            }

            toast.success(`User added to ${estateName}`);
            setEmail('');
            setRole('member');
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label>Role</Label>
                <RadioGroup
                    value={role}
                    onValueChange={(value: string) => setRole(value as 'member' | 'admin')}
                    className="flex space-x-4"
                    disabled={isLoading}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="member" id="member" />
                        <Label htmlFor="member">Member</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <Label htmlFor="admin">Admin</Label>
                    </div>
                </RadioGroup>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Adding User...' : 'Add User'}
            </Button>
        </form>
    );
} 