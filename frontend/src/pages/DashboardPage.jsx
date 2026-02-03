import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, BookOpen, StickyNote, Trophy, ArrowUpRight, Flame, Quote } from 'lucide-react';
import { todosApi } from '../api/todos';
import { diariesApi } from '../api/diaries';
import { notesApi } from '../api/notes';
import { goalsApi } from '../api/goals';
import { MOTIVATIONAL_QUOTES } from '../constants';

const StatWidget = ({ title, value, subtitle, icon: Icon, color, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} onClick={onClick}
    className="cursor-pointer relative overflow-hidden bg-white dark:bg-[#1E1F20] p-6 rounded-3xl border border-gray-200 dark:border-[#444746] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-500 ${color}`} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <ArrowUpRight size={20} className="text-gray-400 group-hover:text-[#A8C7FA] transition-colors" />
    </div>
    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3] mb-1">{value}</h3>
      <p className="font-medium text-gray-600 dark:text-[#C4C7C5]">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  </motion.div>
);

const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState({ todos: 0, diary: 0, notes: 0, goals: 0 });
  const [streak, setStreak] = useState(0);
  const [quote, setQuote] = useState({ text: "Loading...", author: "" });

  useEffect(() => {
    // 1. Fetch Stats & Calculate Streak
    Promise.all([
      todosApi.getAll(),
      diariesApi.getAll(),
      notesApi.getAll(),
      goalsApi.getAll(),
    ]).then(([todos, diaries, notes, goals]) => {
      const today = new Date().toISOString().split('T')[0];
      setStats({
        todos: todos.filter(t => !t.status).length,
        diary: diaries.filter(d => d.entry_datetime?.startsWith(today)).length,
        notes: notes.length,
        goals: goals.filter(g => !g.is_completed).length,
      });

      // Simple Streak Calculation (Consecutive days with at least one completed task)
      const completedDates = new Set(
        todos.filter(t => t.status).map(t => t.completed_datetime?.split('T')[0])
      );
      let currentStreak = 0;
      let checkDate = new Date();
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completedDates.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (currentStreak === 0 && checkDate.toDateString() === new Date().toDateString()) {
           // Allow streak to start today even if not finished yet, check yesterday
           checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    });

    // 2. Fetch Quote (Mock or API)
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Overview</h1>
        <p className="text-gray-500 dark:text-[#C4C7C5]">Your digital brain at a glance.</p>
      </div>

      {/* Main Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget title="Pending Tasks" value={stats.todos} subtitle="Click to view tasks" icon={CheckCircle2} color="bg-emerald-500" delay={0.1} onClick={() => onNavigate('todos')} />
        <StatWidget title="Diary Entries" value={stats.diary} subtitle="Click to write" icon={BookOpen} color="bg-purple-500" delay={0.2} onClick={() => onNavigate('diary')} />
        <StatWidget title="Total Notes" value={stats.notes} subtitle="Click to access notes" icon={StickyNote} color="bg-amber-500" delay={0.3} onClick={() => onNavigate('notes')} />
        <StatWidget title="Active Goals" value={stats.goals} subtitle="Click to track goals" icon={Trophy} color="bg-pink-500" delay={0.4} onClick={() => onNavigate('goals')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote Widget */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 bg-gradient-to-br from-[#003355] to-[#004A77] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <Quote className="absolute top-6 left-6 text-white/10 w-24 h-24 rotate-12" />
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 font-serif leading-relaxed">"{quote.text}"</h2>
            <p className="text-[#A8C7FA] font-medium">— {quote.author}</p>
          </div>
        </motion.div>

        {/* Streak Widget */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
           <div className="absolute inset-0 bg-orange-500/5 dark:bg-orange-500/10" />
           <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4 text-orange-500">
             <Flame size={32} fill="currentColor" />
           </div>
           <h3 className="text-4xl font-extrabold text-gray-800 dark:text-[#E3E3E3] mb-1">{streak}</h3>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Day Streak</p>
           <p className="text-xs text-gray-400 mt-2">Keep the fire burning!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;