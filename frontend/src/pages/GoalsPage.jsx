import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, Edit2, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { goalsApi } from '../api/goals';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import BeautifulCalendar from '../components/common/BeautifulCalendar';

const GoalCard = ({ goal, onEdit, onComplete, onDelete }) => (
  <Card className="p-5 flex flex-col h-full bg-white dark:bg-[#1E1F20] dark:border-[#444746] hover:border-indigo-300 dark:hover:border-[#A8C7FA] transition-all">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${goal.is_completed ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30'}`}>
        {goal.is_completed ? <Check size={20} /> : <div className="w-5 h-5 border-2 border-current rounded-full" />}
      </div>
      <div className="flex gap-1">
        {!goal.is_completed && onComplete && (
          <button onClick={onComplete} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-green-600" title="Mark Complete">
            <Check size={18} />
          </button>
        )}
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-gray-500 dark:text-[#C4C7C5]">
          <Edit2 size={18} />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030] text-red-500">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
    
    <h3 className={`font-bold text-lg mb-2 ${goal.is_completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-[#E3E3E3]'}`}>
      {goal.title}
    </h3>
    <p className="text-gray-500 dark:text-[#C4C7C5] text-sm mb-4 flex-1">{goal.description}</p>
    
    {goal.target_date && (
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 dark:bg-[#131314] p-2 rounded-lg w-fit">
        <CalendarIcon size={14} />
        Target: {new Date(goal.target_date).toLocaleDateString()}
      </div>
    )}
  </Card>
);

const GoalFormModal = ({ isOpen, onClose, goal, onSave }) => {
  const [formData, setFormData] = useState({ title: '', description: '', target_date: '' });
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      });
    } else {
      setFormData({ title: '', description: '', target_date: '' });
    }
  }, [goal]);

  // Close calendar on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };
    if (calendarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
      };
      if (goal) await goalsApi.update(goal.id, data);
      else await goalsApi.create(data);
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Edit Goal' : 'New Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="e.g., Learn React Native"
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Details about your goal..."
        />
        
        {/* Custom Date Picker */}
        <div className="relative" ref={calendarRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-[#C4C7C5] mb-1">Target Date</label>
          <button
            type="button"
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full px-3 py-2 border rounded-lg text-left flex items-center gap-2 bg-white dark:bg-[#1E1F20] dark:border-[#444746] text-gray-700 dark:text-[#E3E3E3] focus:ring-2 focus:ring-indigo-500"
          >
            <CalendarIcon size={18} className="text-[#A8C7FA]" />
            {formData.target_date ? new Date(formData.target_date).toLocaleDateString() : <span className="text-gray-400">Select Date</span>}
          </button>
          
          <AnimatePresence>
            {calendarOpen && (
              <BeautifulCalendar 
                selectedDate={formData.target_date || new Date().toISOString().split('T')[0]} 
                onChange={(date) => {
                  setFormData({ ...formData, target_date: date });
                  setCalendarOpen(false);
                }} 
                onClose={() => setCalendarOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} className="bg-[#A8C7FA] text-[#003355]">Save Goal</Button>
        </div>
      </form>
    </Modal>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const loadGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadGoals(); }, []);

  const handleComplete = async (id) => {
    try { await goalsApi.complete(id); loadGoals(); } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal?')) {
      try { await goalsApi.delete(id); loadGoals(); } catch (err) { console.error(err); }
    }
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
        <Button onClick={() => { setEditingGoal(null); setShowModal(true); }} className="rounded-xl bg-[#A8C7FA] text-[#003355]">
          <Plus size={20} className="mr-2" /> New Goal
        </Button>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Active — {activeGoals.length}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onEdit={() => { setEditingGoal(goal); setShowModal(true); }} onComplete={() => handleComplete(goal.id)} onDelete={() => handleDelete(goal.id)} />
            ))}
            {activeGoals.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No active goals. Time to set one!</div>}
          </div>
        </section>

        {completedGoals.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Completed — {completedGoals.length}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
              {completedGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onEdit={() => { setEditingGoal(goal); setShowModal(true); }} onDelete={() => handleDelete(goal.id)} />
              ))}
            </div>
          </section>
        )}
      </div>

      <GoalFormModal isOpen={showModal} onClose={() => setShowModal(false)} goal={editingGoal} onSave={() => { loadGoals(); setShowModal(false); }} />
    </div>
  );
};

export default GoalsPage;