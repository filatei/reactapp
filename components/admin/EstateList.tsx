"use client";

import { useEffect, useState } from 'react';
import { IEstate } from '@/models/Estate';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUsers, FaEnvelope, FaEdit } from 'react-icons/fa';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface EstateListProps {
    estates: IEstate[];
}

export function EstateList({ estates: initialEstates }: EstateListProps) {
    const [estates, setEstates] = useState(initialEstates);
    const router = useRouter();

    useEffect(() => {
        const eventSource = new EventSource('/api/estates/events');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'initial') {
                setEstates(data.data);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this estate?')) {
            return;
        }

        try {
            const response = await fetch(`/api/estates/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete estate');
            }

            toast.success('Estate deleted successfully');
        } catch (error) {
            console.error('Failed to delete estate:', error);
            toast.error('Failed to delete estate');
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {estates.map((estate) => (
                    <div
                        key={estate._id.toString()}
                        className="flex items-center justify-between p-4 bg-card rounded-lg border"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <FaBuilding className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-medium">{estate.name}</h3>
                                <p className="text-sm text-muted-foreground">{estate.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <FaUsers />
                                        <span>{estate.members.length}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Total Members</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <FaEnvelope />
                                        <span>{estate.admins.length}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Estate Administrators</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push(`/admin/estates/${estate._id.toString()}`)}
                                        className="text-primary hover:text-primary/90 hover:bg-primary/10"
                                    >
                                        <FaEdit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Manage Estate</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(estate._id.toString())}
                                className="bg-destructive text-white hover:bg-destructive/90 dark:text-destructive-foreground"
                            >
                                Delete
                            </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete Estate</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                ))}
            </div>
        </TooltipProvider>
    );
} 