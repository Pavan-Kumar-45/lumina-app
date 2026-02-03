import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Textarea from '../../common/Textarea';
import BeautifulCalendar from '../../common/BeautifulCalendar';
import { useClickOutside } from '../../../hooks/useModal';
import { extractDate, toISODateTime } from '../../../utils/dateUtils';
import { goalsApi } from '../../../api/goals';

/**
 * GoalFormModal component - Modal for creating/editing goals
 */
const GoalFormModal = ({ isOpen, onClose, goal, onSave }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    target_date: '' 
  });
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useClickOutside(() => setCalendarOpen(false));

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        target_date: goal.target_date ? extractDate(goal.target_date) : '',
      });
    } else {
      setFormData({ title: '', description: '', target_date: '' });
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        target_date: toISODateTime(formData.target_date),
      };
      if (goal) {
        await goalsApi.update(goal.id, data);
      } else {
        await goalsApi.create(data);
      }
      onSave();
    } catch (err) {
      console.error('Error saving goal:', err);
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
          <label className="block text-sm font-medium text-gray-700 dark:text-[#C4C7C5] mb-1">
            Target Date
          </label>
          <button
            type="button"
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="w-full px-3 py-2 border rounded-lg text-left flex items-center gap-2 bg-white dark:bg-[#1E1F20] dark:border-[#444746] text-gray-700 dark:text-[#E3E3E3] focus:ring-2 focus:ring-indigo-500"
          >
            <CalendarIcon size={18} className="text-[#A8C7FA]" />
            {formData.target_date ? (
              new Date(formData.target_date).toLocaleDateString()
            ) : (
              <span className="text-gray-400">Select Date</span>
            )}
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
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-[#A8C7FA] text-[#003355]">
            Save Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalFormModal;
