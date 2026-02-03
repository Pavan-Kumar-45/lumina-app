import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';
import ExportButton from '../../common/ExportButton';
import { formatDateLong } from '../../../utils/dateUtils';
import { useAsync } from '../../../hooks/useFetch';

/**
 * DiaryEditor component - Full-screen editor for diary entries
 */
const DiaryEditor = ({ entry, date, onSave, onBack }) => {
  const [data, setData] = useState(entry || { title: '', content: '' });
  const { loading: saving, execute } = useAsync();

  useEffect(() => {
    setData(entry || { title: '', content: '' });
  }, [entry]);

  const handleSave = async () => {
    await execute(() => onSave(data));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 dark:text-[#C4C7C5] hover:text-[#A8C7FA] transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Back
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium bg-white dark:bg-[#1E1F20] px-3 py-1 rounded-full border border-gray-200 dark:border-[#444746]">
            {formatDateLong(date)}
          </span>
          
          {/* Export Button */}
          <ExportButton
            content={data.content}
            filename={`Journal-${date}`}
            title={data.title}
            variant="icon"
          />

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-6 bg-[#A8C7FA] text-[#003355]"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
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

export default DiaryEditor;
