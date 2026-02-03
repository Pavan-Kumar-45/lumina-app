import React, { useState, useEffect } from 'react';
import { Plus, Lock } from 'lucide-react';
import { todosApi } from '../api/todos';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useModal } from '../hooks/useModal';
import { isPastDate } from '../utils/dateUtils';
import Button from '../components/common/Button';
import DateNavigator from '../components/common/DateNavigator';
import TaskList from '../components/features/todos/TaskList';
import TaskFormModal from '../components/features/todos/TaskFormModal';

const TodosPage = () => {
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const { date, setDate, nextDay, previousDay } = useDateNavigation();
  const { isOpen: modalOpen, open: openModal, close: closeModal } = useModal();

  const isPast = isPastDate(date);

  const loadTodos = async () => {
    try {
      const data = await todosApi.getByDate(date);
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load todos", err);
      setTodos([]);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [date]);

  const handleToggleTodo = async (todo) => {
    setTodos(prev => prev.map(t => 
      t.id === todo.id ? { ...t, status: !t.status } : t
    ));
    await todosApi.updateStatus(todo.id, !todo.status);
  };

  const handleSaveTodo = async (taskTitle, editingTodo) => {
    try {
      if (editingTodo) {
        await todosApi.update(editingTodo.id, { 
          ...editingTodo, 
          title: taskTitle 
        });
      } else {
        await todosApi.create({ 
          title: taskTitle, 
          date: date, 
          priority: 'medium' 
        });
      }
      loadTodos();
    } catch (error) {
      console.error("Error saving todo:", error);
    }
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    openModal();
  };

  const handleOpenNewTaskModal = () => {
    setEditingTodo(null);
    openModal();
  };

  const handleCloseModal = () => {
    setEditingTodo(null);
    closeModal();
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-[#E3E3E3] mb-2">
            Tasks
          </h1>
          <p className="text-gray-500 dark:text-[#C4C7C5]">
            {isPast ? "History View (Read Only)" : "Focus on today"}
          </p>
        </div>
        
        <div className="flex gap-3 items-center">
          <DateNavigator
            date={date}
            onDateChange={setDate}
            onNextDay={nextDay}
            onPreviousDay={previousDay}
          />

          <Button 
            onClick={handleOpenNewTaskModal}
            disabled={isPast}
            className={`rounded-xl px-4 ${
              isPast 
                ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                : 'bg-[#A8C7FA] text-[#003355]'
            }`}
          >
            {isPast ? <Lock size={20} /> : <Plus size={20} />}
          </Button>
        </div>
      </div>

      {/* Task List */}
      <TaskList 
        todos={todos}
        isPast={isPast}
        onToggle={handleToggleTodo}
        onEdit={handleEditTodo}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
        isPast={isPast}
      />
    </div>
  );
};

export default TodosPage;