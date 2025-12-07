import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar as CalendarIcon, CheckCircle2, Circle, ChevronDown, ChevronRight, Lock, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { todosApi } from '../api/todos';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import BeautifulCalendar from '../components/common/BeautifulCalendar';

const TodosPage = () => {
  const [todos, setTodos] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const calendarRef = useRef(null);

  const isPast = new Date(date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  const load = async () => {
    const data = await todosApi.getByDate(date);
    setTodos(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, [date]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const toggle = async (todo) => {
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: !t.status } : t));
    await todosApi.updateStatus(todo.id, !todo.status);
  };

  const add = async (e) => {
    e.preventDefault();
    if (isPast) return; 
    await todosApi.create({ title: newTask, todo_date: date, priority: 'medium' });
    setNewTask('');
    setModalOpen(false);
    load();
  };

  const pendingTodos = todos.filter(t => !t.status);
  const completedTodos = todos.filter(t => t.status);

  const TaskRow = ({ todo }) => (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-3">
      <div onClick={() => toggle(todo)} className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${todo.status ? 'bg-gray-100/50 dark:bg-[#1E1F20] border-transparent opacity-60' : 'bg-white dark:bg-[#1E1F20] border-gray-100 dark:border-[#444746] shadow-sm hover:shadow-md'}`}>
        <button className={todo.status ? 'text-[#A8C7FA]' : 'text-gray-300 dark:text-gray-600 group-hover:text-[#A8C7FA]'}>
          {todo.status ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        <span className={`text-lg font-medium flex-1 ${todo.status ? 'line-through text-gray-400' : 'text-gray-700 dark:text-[#E3E3E3]'}`}>{todo.title}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-[#E3E3E3] mb-2">Tasks</h1>
          <p className="text-gray-500 dark:text-[#C4C7C5]">{isPast ? "History View (Read Only)" : "Focus on today"}</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex items-center bg-white dark:bg-[#1E1F20] p-1 rounded-xl border border-gray-200 dark:border-[#444746] shadow-sm">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"><ChevronLeft size={20} /></button>
            <div className="relative" ref={calendarRef}>
              <button onClick={() => setCalendarOpen(!calendarOpen)} className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-[#E3E3E3] font-medium hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg transition-colors">
                <CalendarIcon size={18} className="text-[#A8C7FA]" />
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
              <AnimatePresence>
                {calendarOpen && <BeautifulCalendar selectedDate={date} onChange={setDate} onClose={() => setCalendarOpen(false)} />}
              </AnimatePresence>
            </div>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"><ChevronRight size={20} /></button>
          </div>

          <Button onClick={() => setModalOpen(true)} disabled={isPast} className={`rounded-xl px-4 ${isPast ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-[#A8C7FA] text-[#003355]'}`}>
            {isPast ? <Lock size={20} /> : <Plus size={20} />}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Pending — {pendingTodos.length}</h2>
          <AnimatePresence mode="popLayout">{pendingTodos.map(todo => <TaskRow key={todo.id} todo={todo} />)}</AnimatePresence>
          {pendingTodos.length === 0 && <div className="text-center py-12 text-gray-400 dark:text-[#5E5E5E]">No pending tasks.</div>}
        </section>

        {completedTodos.length > 0 && (
          <section>
            <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              {showCompleted ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Completed — {completedTodos.length}
            </button>
            <AnimatePresence>
              {showCompleted && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">{completedTodos.map(todo => <TaskRow key={todo.id} todo={todo} />)}</motion.div>}
            </AnimatePresence>
          </section>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={add} className="space-y-4">
          <Input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="e.g., Read 10 pages" autoFocus />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodosPage;