import React, { useState } from 'react';
import Modal from '../../common/Modal';
import Input from '../../common/Input';
import Button from '../../common/Button';

/**
 * TaskFormModal component - Modal for creating/editing tasks
 */
const TaskFormModal = ({ isOpen, onClose, onSave, editingTodo, isPast }) => {
  const [taskTitle, setTaskTitle] = useState(editingTodo?.title || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPast && !editingTodo) return;

    await onSave(taskTitle, editingTodo);
    setTaskTitle('');
    onClose();
  };

  // Reset form when modal opens/closes or editingTodo changes
  React.useEffect(() => {
    setTaskTitle(editingTodo?.title || '');
  }, [editingTodo, isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingTodo ? "Edit Task" : "New Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          value={taskTitle}
          onChange={e => setTaskTitle(e.target.value)}
          placeholder="e.g., Read 10 pages"
          autoFocus
          required
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            {editingTodo ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
