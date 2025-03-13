import { Metadata } from 'next';
import EditTaskClient from './EditTaskClient';

export const metadata: Metadata = {
  title: 'Edit Task',
  description: 'Edit an existing task',
};

type Props = {
  params: { id: string }
}

export default async function EditTaskPage({ params }: Props) {
  const paramId = (await params).id
  return <EditTaskClient id={paramId} />;
} 