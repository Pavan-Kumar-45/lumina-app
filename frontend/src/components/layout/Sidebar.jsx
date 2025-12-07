import React, { useState, useEffect, useRef } from 'react';
import { Home, CheckCircle2, Book, StickyNote, Trophy, Settings, X, Sparkles, Search, Loader2, ChevronRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notesApi } from '../../api/notes';
import { todosApi } from '../../api/todos';
import { diariesApi } from '../../api/diaries';
import { goalsApi } from '../../api/goals';

const Sidebar = ({ isOpen, onClose, currentPage, setCurrentPage }) => {
  const links = [
    { page: 'dashboard', icon: Home, label: 'Overview' },
    { page: 'todos', icon: CheckCircle2, label: 'Tasks' },
    { page: 'diary', icon: Book, label: 'Journal' },
    { page: 'notes', icon: StickyNote, label: 'Notes' },
    { page: 'goals', icon: Trophy, label: 'Goals' },
    { page: 'settings', icon: Settings, label: 'Settings' },
  ];

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Real-time Autocomplete Logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const term = query.trim();
      if (term.length > 1) {
        setLoading(true);
        try {
          // Fetch everything to filter locally (or replace with backend search endpoints)
          const [notes, todos, diaries, goals] = await Promise.all([
            notesApi.getAll().then(res => res.filter(n => n.title.toLowerCase().includes(term.toLowerCase()))),
            todosApi.getAll().then(res => res.filter(t => t.title.toLowerCase().includes(term.toLowerCase()))),
            diariesApi.getAll().then(res => res.filter(d => d.title?.toLowerCase().includes(term.toLowerCase()))),
            goalsApi.getAll().then(res => res.filter(g => g.title.toLowerCase().includes(term.toLowerCase())))
          ]);
          
          const hasResults = notes.length || todos.length || diaries.length || goals.length;
          setResults(hasResults ? { notes, todos, diaries, goals } : { empty: true });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setLoading(false);
      }
    }, 300); // Fast debounce for "type-ahead" feel

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (page) => {
    setCurrentPage(page);
    setQuery('');
    setResults(null);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}
      </AnimatePresence>

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-80 p-4 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-full bg-white/90 dark:bg-[#1E1F20] backdrop-blur-2xl border border-gray-200 dark:border-[#444746] rounded-3xl flex flex-col shadow-2xl md:shadow-none overflow-visible relative">
          
          {/* Header */}
          <div className="p-6 pb-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#A8C7FA] rounded-full flex items-center justify-center text-[#003355]"><Sparkles size={18} /></div>
              <span className="text-xl font-bold text-gray-800 dark:text-[#E3E3E3]">Lumina</span>
            </div>
            <button onClick={onClose} className="md:hidden p-1 text-gray-400"><X size={20} /></button>
          </div>

          {/* Search / Autocomplete Input */}
          <div className="px-4 py-4 relative z-50" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..." 
                className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-[#303030] border-none rounded-xl text-sm text-gray-800 dark:text-[#E3E3E3] focus:ring-2 focus:ring-[#A8C7FA] transition-all placeholder-gray-400"
              />
              {loading ? (
                <Loader2 className="absolute right-3 top-2.5 text-[#A8C7FA] animate-spin" size={16} />
              ) : query && (
                <button onClick={() => {setQuery(''); setResults(null)}} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><X size={16}/></button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {results && (
                <motion.div 
                  initial={{ opacity: 0, y: 5, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-4 right-4 top-12 bg-white dark:bg-[#252526] rounded-xl shadow-xl border border-gray-200 dark:border-[#444746] overflow-hidden z-[60]"
                >
                  {results.empty ? (
                    <div className="p-3 text-center text-xs text-gray-500">No matches found</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto custom-scrollbar py-2">
                       {/* Grouped Suggestions */}
                       <SuggestionGroup title="Notes" items={results.notes} icon={StickyNote} onClick={() => handleResultClick('notes')} />
                       <SuggestionGroup title="Tasks" items={results.todos} icon={CheckCircle2} onClick={() => handleResultClick('todos')} />
                       <SuggestionGroup title="Journal" items={results.diaries} icon={Book} onClick={() => handleResultClick('diary')} />
                       <SuggestionGroup title="Goals" items={results.goals} icon={Trophy} onClick={() => handleResultClick('goals')} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
            {links.map(({ page, icon: Icon, label }) => {
              const active = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page); if(window.innerWidth < 768) onClose(); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active ? 'text-[#003355] font-bold' : 'text-gray-500 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#303030]'}`}
                >
                  {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-[#D3E3FD] dark:bg-[#A8C7FA]" />}
                  <span className="relative z-10 flex items-center gap-3">
                    <Icon size={18} className={active ? 'text-[#003355]' : 'group-hover:scale-110 transition-transform'} />
                    <span className="text-sm">{label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

const SuggestionGroup = ({ title, items, icon: Icon, onClick }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-2 mb-2">
      <div className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1 tracking-wider flex items-center gap-1">
        <Icon size={10} /> {title}
      </div>
      {items.slice(0, 3).map((item, i) => (
        <button key={i} onClick={onClick} className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg flex items-center gap-2 group transition-colors">
          <span className="text-sm text-gray-700 dark:text-[#E3E3E3] truncate flex-1">{item.title || "Untitled"}</span>
          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-[#A8C7FA]" />
        </button>
      ))}
    </div>
  );
};

export default Sidebar;