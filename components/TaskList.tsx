import { ITask } from '@/models/Task';
import { TaskCard } from './TaskCard';

interface SerializedTask extends Omit<ITask, '_id' | 'estate' | 'createdBy' | 'assignedTo'> {
  _id: string;
  estate: string;
  createdBy: { _id: string; name: string; email: string; };
  assignedTo?: { _id: string; name: string; email: string; } | null;
}

interface TaskListProps {
  tasks: SerializedTask[];
  view: 'grid' | 'list';
  onStatusChange?: (id: string, status: ITask['status']) => void;
}

export function TaskList({ tasks, view, onStatusChange }: TaskListProps) {
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
} 