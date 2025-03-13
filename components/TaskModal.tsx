import { ITask } from '@/models/Task';
import { TaskForm } from './TaskForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskSubmissionData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdBy?: string;
}

interface TaskModalProps {
  task?: ITask;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

export function TaskModal({ task, isOpen, onClose, onSubmit }: TaskModalProps) {
  const handleSubmit = (data: TaskSubmissionData) => {
    onSubmit({
      ...data,
      status: data.status || 'todo',
      priority: data.priority || 'medium'
    } as Omit<ITask, '_id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 