import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ITask } from "@/models/Task"

interface TaskStatusModalProps {
  task: ITask;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: ITask['status']) => void;
}

export function TaskStatusModal({ task, isOpen, onClose, onStatusChange }: TaskStatusModalProps) {
  const statusOptions: ITask['status'][] = ['todo', 'in-progress', 'done'];
  const currentIndex = statusOptions.indexOf(task.status);
  const nextStatus = statusOptions[currentIndex + 1];

  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Task Status</DialogTitle>
          <DialogDescription>
            Do you want to move &ldquo;{task.title}&rdquo; from {statusLabels[task.status]} to {statusLabels[nextStatus]}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => {
            onStatusChange(nextStatus);
            onClose();
          }}>
            Move to {statusLabels[nextStatus]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 