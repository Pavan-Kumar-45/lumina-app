import React from 'react';
import { Download, FileText, List, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal, useClickOutside } from '../../hooks/useModal';
import { exportFile } from '../../utils/exportUtils';
import { ANIMATION_VARIANTS } from '../../constants';

/**
 * ExportButton component - Reusable export dropdown menu
 */
const ExportButton = ({ content, filename, title, variant = 'icon' }) => {
  const { isOpen, toggle, close } = useModal();
  const menuRef = useClickOutside(close);

  const handleExport = (format) => {
    exportFile(content, filename, format, title);
    close();
  };

  return (
    <div className="relative" ref={menuRef}>
      {variant === 'icon' ? (
        <button 
          onClick={toggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg text-gray-500 dark:text-[#C4C7C5] transition-colors"
          title="Export"
        >
          <Download size={20} />
        </button>
      ) : (
        <button 
          onClick={toggle}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#444746] rounded-lg hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-[#E3E3E3] transition-colors"
        >
          <Download size={18} />
          Export
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            {...ANIMATION_VARIANTS.scaleIn}
            className="absolute right-0 top-12 bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#444746] rounded-xl shadow-xl z-50 w-40 overflow-hidden"
          >
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#303030]">
              Export As
            </div>
            <button 
              onClick={() => handleExport('md')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2"
            >
              <FileText size={14} /> Markdown
            </button>
            <button 
              onClick={() => handleExport('txt')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2"
            >
              <List size={14} /> Text File
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2"
            >
              <Printer size={14} /> PDF (Print)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;
