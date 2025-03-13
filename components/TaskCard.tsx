import { useState } from 'react';
import { ITask } from '@/models/Task';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Types } from 'mongoose';
import Link from 'next/link';
import { Pencil, Trash } from 'lucide-react';
import { TaskStatusModal } from './TaskStatusModal';

interface TaskCardProps {
  task: ITask & { _id: Types.ObjectId };
  onStatusChange?: (id: string, status: ITask['status']) => void;
}

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'done': 'bg-green-100 text-green-800'
};

const priorityColors = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-red-100 text-red-800'
};

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-semibold">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Link href={`/tasks/edit/${task._id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/tasks/delete/${task._id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                  <Trash className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge 
              className={statusColors[task.status]}
              onClick={() => task.status !== 'done' && setIsStatusModalOpen(true)}
            >
              {task.status}
            </Badge>
            <Badge className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{task.description}</p>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          {task.dueDate && (
            <p>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
          )}
        </CardFooter>
      </Card>

      <TaskStatusModal
        task={task}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onStatusChange={(newStatus) => {
          onStatusChange?.(task._id.toString(), newStatus);
        }}
      />
    </>
  );
} 