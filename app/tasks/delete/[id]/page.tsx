import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DeleteTaskClient } from '@/components/tasks/DeleteTaskClient';

export const metadata: Metadata = {
    title: 'Delete Task | ReactiveApp',
    description: 'Delete a task from your list',
};

interface PageProps {
    params: {
        id: string;
    };
}

export default async function DeleteTaskPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
        redirect('/auth/signin');
    }

    return <DeleteTaskClient id={params.id} />;
}