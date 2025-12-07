import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Calendar as CalendarIcon, ArrowLeft, Plus, BookOpen, Clock, Lock, 
  ChevronLeft, ChevronRight, Download, FileText, Printer 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { diariesApi } from '../api/diaries';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import BeautifulCalendar from '../components/common/BeautifulCalendar';

// --- EXPORT MENU (New Component) ---
const ExportMenu = ({ onExport, onClose }) => {
  const menuRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      ref={menuRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute right-0 top-12 bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#444746] rounded-xl shadow-xl z-50 w-40 overflow-hidden"
    >
      <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#303030]">Export As</div>
      <button onClick={() => onExport('md')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
        <FileText size={14} /> Markdown
      </button>
      <button onClick={() => onExport('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
        <ListIcon size={14} /> Text File
      </button>
      <button onClick={() => onExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
        <Printer size={14} /> PDF (Print)
      </button>
    </motion.div>
  );
};

// Helper Icon for Text File (since List is used elsewhere or not imported)
const ListIcon = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;


const DiaryDashboard = ({ entries, onSelectEntry, onNewEntry, selectedDate }) => {
  const isPast = new Date(selectedDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Diary</h1>
          <p className="text-gray-500 dark:text-[#C4C7C5]">{isPast ? "Past Entries" : "Reflect on today"}</p>
        </div>
        <Button onClick={onNewEntry} disabled={isPast} className={`rounded-xl px-6 ${isPast ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#A8C7FA] text-[#003355]'}`}>
          {isPast ? <span className="flex items-center gap-2"><Lock size={16} /> Locked</span> : <span className="flex items-center gap-2"><Plus size={18} /> New Entry</span>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {entries.map((entry) => (
            <Card 
              key={entry.id} 
              onClick={() => onSelectEntry(entry)}
              className="h-56 flex flex-col cursor-pointer group hover:border-[#A8C7FA]/50 transition-all p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 dark:bg-[#A8C7FA]/20 rounded-xl text-indigo-600 dark:text-[#A8C7FA]">
                  <BookOpen size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 dark:bg-[#131314] px-2 py-1 rounded-md">
                  <Clock size={12} />
                  {new Date(entry.entry_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-800 dark:text-[#E3E3E3] mb-3 line-clamp-1 group-hover:text-[#A8C7FA] transition-colors">
                {entry.title || 'Untitled'}
              </h3>
              <p className="text-gray-500 dark:text-[#C4C7C5] text-sm line-clamp-3 font-serif leading-relaxed">
                {entry.content}
              </p>
            </Card>
          ))}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="col-span-full py-24 text-center text-gray-400 dark:text-[#5E5E5E] border-2 border-dashed border-gray-200 dark:border-[#444746] rounded-3xl">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p>No entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DiaryEditor = ({ entry, date, onSave, onBack }) => {
  const [data, setData] = useState(entry || { title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false); // New State for Export Menu

  const handleSave = async () => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  // Export Handler Logic
  const handleExport = (format) => {
    const filename = `Journal-${new Date(date).toISOString().split('T')[0]}`;
    if (format === 'pdf') {
      window.print();
    } else {
      const mimeType = format === 'md' ? 'text/markdown' : 'text/plain';
      const extension = format === 'md' ? 'md' : 'txt';
      // For TXT, simple strip; for MD, keep as is
      const content = data.content; 
      
      const element = document.createElement("a");
      const file = new Blob([`# ${data.title}\n\n${content}`], {type: mimeType});
      element.href = URL.createObjectURL(file);
      element.download = `${filename}.${extension}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    setExportOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-[#C4C7C5] hover:text-[#A8C7FA] transition-colors font-medium">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium bg-white dark:bg-[#1E1F20] px-3 py-1 rounded-full border border-gray-200 dark:border-[#444746]">
            {new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
          
          {/* EXPORT DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setExportOpen(!exportOpen)} 
              className="p-2 rounded-full bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] text-gray-500 dark:text-[#C4C7C5] hover:text-[#A8C7FA] hover:border-[#A8C7FA] transition-colors"
              title="Export Entry"
            >
              <Download size={18} />
            </button>
            <AnimatePresence>
              {exportOpen && <ExportMenu onClose={() => setExportOpen(false)} onExport={handleExport} />}
            </AnimatePresence>
          </div>

          <Button onClick={handleSave} disabled={saving} className="rounded-full px-6 bg-[#A8C7FA] text-[#003355]">
            <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#1E1F20] rounded-[2rem] shadow-2xl dark:shadow-none border border-white/20 dark:border-[#444746] overflow-hidden relative p-8 md:p-16">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8 md:p-16">
          <input 
            placeholder="Title your entry..."
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-full text-4xl md:text-5xl font-serif font-bold text-gray-800 dark:text-[#E3E3E3] placeholder-gray-300 dark:placeholder-[#444746] border-none focus:ring-0 p-0 bg-transparent mb-8 custom-caret"
          />
          <textarea 
            placeholder="Start writing..."
            value={data.content}
            onChange={(e) => setData({ ...data, content: e.target.value })}
            className="w-full h-full resize-none font-serif text-lg md:text-xl leading-loose text-gray-600 dark:text-[#C4C7C5] placeholder-gray-300 dark:placeholder-[#444746] border-none focus:ring-0 p-0 bg-transparent custom-caret"
            spellCheck="false"
          />
        </div>
      </div>
    </motion.div>
  );
};

const DiaryPage = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('dashboard');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const load = async () => {
    const data = await diariesApi.getByDate(date);
    setEntries(Array.isArray(data) ? data : []);
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

  const handleSave = async (entryData) => {
    const payload = { ...entryData, entry_datetime: new Date().toISOString() };
    if (entryData.id) await diariesApi.update(entryData.id, payload);
    else await diariesApi.create(payload);
    await load();
    setView('dashboard');
  };

  return (
    <div className="h-full flex flex-col">
      {view === 'dashboard' && (
        <div className="mb-8 flex justify-end">
           <div className="flex items-center bg-white dark:bg-[#1E1F20] p-1 rounded-xl border border-gray-200 dark:border-[#444746] shadow-sm">
             <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"><ChevronLeft size={20} /></button>
             <div className="relative" ref={calendarRef}>
                <button 
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-[#E3E3E3] font-medium hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg transition-colors"
                >
                  <CalendarIcon size={18} className="text-[#A8C7FA]" />
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </button>
                <AnimatePresence>
                  {/* ALIGN RIGHT TO PREVENT OVERFLOW */}
                  {calendarOpen && <BeautifulCalendar selectedDate={date} onChange={setDate} onClose={() => setCalendarOpen(false)} align="right" />}
                </AnimatePresence>
             </div>
             <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5]"><ChevronRight size={20} /></button>
           </div>
        </div>
      )}

      {view === 'dashboard' ? (
        <DiaryDashboard entries={entries} selectedDate={date} onSelectEntry={(entry) => { setCurrentEntry(entry); setView('editor'); }} onNewEntry={() => { setCurrentEntry(null); setView('editor'); }} />
      ) : (
        <DiaryEditor entry={currentEntry} date={date} onBack={() => setView('dashboard')} onSave={handleSave} />
      )}
    </div>
  );
};

export default DiaryPage;