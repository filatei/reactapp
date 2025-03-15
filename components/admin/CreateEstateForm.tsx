"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const estateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    description: z.string().min(1, 'Description is required'),
});

type EstateFormData = z.infer<typeof estateSchema>;

export function CreateEstateForm() {
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EstateFormData>({
        resolver: zodResolver(estateSchema),
    });

    const onSubmit = async (data: EstateFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/estates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create estate');
            }

            toast.success('Estate created successfully');
            reset();
        } catch (error) {
            toast.error('Failed to create estate');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Input
                    placeholder="Estate Name"
                    {...register('name')}
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Input
                    placeholder="Address"
                    {...register('address')}
                    disabled={isLoading}
                />
                {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Textarea
                    placeholder="Description"
                    {...register('description')}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Estate'}
            </Button>
        </form>
    );
} 