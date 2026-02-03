import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { goalsApi } from '../api/goals';
import { useModal } from '../hooks/useModal';
import Button from '../components/common/Button';
import GoalsList from '../components/features/goals/GoalsList';
import GoalFormModal from '../components/features/goals/GoalFormModal';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const { isOpen: showModal, open: openModal, close: closeModal } = useModal();

  const loadGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading goals:', err);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleComplete = async (id) => {
    try {
      await goalsApi.complete(id);
      loadGoals();
    } catch (err) {
      console.error('Error completing goal:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try {
        await goalsApi.delete(id);
        loadGoals();
      } catch (err) {
        console.error('Error deleting goal:', err);
      }
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    openModal();
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    openModal();
  };

  const handleSaveComplete = () => {
    loadGoals();
    closeModal();
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Goals</h1>
          <p className="text-gray-500 dark:text-[#C4C7C5]">Set targets, achieve dreams.</p>
        </div>
        <Button 
          onClick={handleNewGoal}
          className="rounded-xl bg-[#A8C7FA] text-[#003355]"
        >
          <Plus size={20} className="mr-2" /> New Goal
        </Button>
      </div>

      <div className="space-y-8">
        {/* Active Goals */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
            Active — {activeGoals.length}
          </h2>
          <GoalsList
            goals={activeGoals}
            onEdit={handleEdit}
            onComplete={handleComplete}
            onDelete={handleDelete}
            emptyMessage="No active goals. Time to set one!"
          />
        </section>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
              Completed — {completedGoals.length}
            </h2>
            <div className="opacity-70">
              <GoalsList
                goals={completedGoals}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </section>
        )}
      </div>

      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={showModal}
        onClose={closeModal}
        goal={editingGoal}
        onSave={handleSaveComplete}
      />
    </div>
  );
};

export default GoalsPage;