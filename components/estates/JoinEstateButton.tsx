import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface JoinEstateButtonProps {
    estateId: string;
    estateName: string;
}

export function JoinEstateButton({ estateId, estateName }: JoinEstateButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleJoinRequest = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/estates/${estateId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit join request');
            }

            toast.success(`Join request sent for ${estateName}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit join request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleJoinRequest}
            disabled={isLoading}
            variant="outline"
            className="w-full"
        >
            {isLoading ? 'Sending Request...' : 'Request to Join'}
        </Button>
    );
} 