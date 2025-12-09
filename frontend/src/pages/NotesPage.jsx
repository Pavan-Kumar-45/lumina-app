import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Plus, X, HelpCircle, Copy, Check, Eye, EyeOff, Save, Trash2, 
  ArrowLeft, Edit3, Type, List, Code, Quote, Table, Sigma, Image,
  ClipboardList, ArrowDownLeft, FileText, Columns, Tag, Download, Maximize, Minimize, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { notesApi } from '../api/notes';
import Button from '../components/common/Button';

// --- PLUGINS ---
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks'; 
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- PORTAL COMPONENT ---
const FullScreenPortal = ({ children }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#F0F4F8] dark:bg-[#131314] flex flex-col">
      {children}
    </div>,
    document.body
  );
};

// --- GENERIC COPY WRAPPER ---
const CopyWrapper = ({ children, copyContent, type = "Content", className = "" }) => {
  const [copied, setCopied] = useState(false);
  const contentRef = useRef(null);

  const handleCopy = (e) => {
    e.stopPropagation();
    let textToCopy = copyContent;
    if (!textToCopy && contentRef.current) {
      textToCopy = contentRef.current.innerText;
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`relative group my-4 ${className}`} ref={contentRef}>
      <div className="absolute right-0 -top-7 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleCopy} 
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-200 dark:bg-[#303030] text-gray-600 dark:text-[#C4C7C5] hover:text-indigo-600 dark:hover:text-[#A8C7FA] shadow-sm border border-gray-300 dark:border-[#505050] text-xs font-medium"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? "Copied" : type}
        </button>
      </div>
      {children}
    </div>
  );
};

// --- SMART CODE BLOCK ---
const CodeBlock = ({ language, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-[#444746]">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleCopy} className="p-1.5 rounded-lg bg-gray-800/50 text-gray-300 hover:text-white backdrop-blur-sm border border-white/10">
          {copied ? <Check size={14} className="text-green-400" /> : <ClipboardList size={14} />}
        </button>
      </div>
      <div className="absolute left-4 top-2 text-xs text-gray-500 font-mono uppercase select-none">
        {language || 'text'}
      </div>
      <SyntaxHighlighter style={oneDark} language={language} PreTag="div" customStyle={{ margin: 0, padding: '2.5rem 1.5rem 1.5rem 1.5rem', backgroundColor: '#1E1F20' }} {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

// --- EXPORT MENU ---
const ExportMenu = ({ onExport }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
    className="absolute right-0 top-12 bg-white dark:bg-[#252526] border border-gray-200 dark:border-[#444746] rounded-xl shadow-xl z-50 w-40 overflow-hidden"
  >
    <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#303030]">Export As</div>
    <button onClick={() => onExport('md')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
      <FileText size={14} /> Markdown
    </button>
    <button onClick={() => onExport('txt')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
      <List size={14} /> Text File
    </button>
    <button onClick={() => onExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] flex items-center gap-2">
      <Download size={14} /> PDF (Print)
    </button>
  </motion.div>
);

// --- MARKDOWN GUIDE ---
const MarkdownGuide = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-16 bottom-0 w-96 bg-white dark:bg-[#1E1F20] border-l border-gray-200 dark:border-[#444746] shadow-2xl z-50 flex flex-col"
        >
          <div className="p-5 border-b border-gray-100 dark:border-[#444746] flex justify-between items-center bg-gray-50 dark:bg-[#252526]">
            <h3 className="font-bold text-gray-800 dark:text-[#E3E3E3] flex items-center gap-2">
              <HelpCircle size={18} className="text-[#A8C7FA]" /> Markdown Guide
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-[#303030] rounded text-gray-500"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <GuideSection title="Headers" icon={<Type size={16} />}>
              <CodeExample code="# Header 1" label="Big Title" />
              <CodeExample code="## Header 2" label="Section" />
              <CodeExample code="### Header 3" label="Subsection" />
            </GuideSection>

            <GuideSection title="Emphasis" icon={<Quote size={16} />}>
              <CodeExample code="**Bold**" />
              <CodeExample code="*Italic*" />
              <CodeExample code="~~Strike~~" />
              <CodeExample code="> Blockquote" />
            </GuideSection>

            <GuideSection title="Lists" icon={<List size={16} />}>
              <CodeExample code="- Bullet point" />
              <CodeExample code="1. Numbered list" />
              <CodeExample code="- [ ] To-do item" />
              <CodeExample code="- [x] Completed item" />
            </GuideSection>

            <GuideSection title="Code" icon={<Code size={16} />}>
              <CodeExample code="`inline code`" />
              <pre className="bg-gray-100 dark:bg-[#303030] p-2 rounded text-xs text-gray-700 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700 mt-2">
{`\`\`\`js
console.log("Hi");
\`\`\``}
              </pre>
            </GuideSection>

            <GuideSection title="Math (LaTeX)" icon={<Sigma size={16} />}>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Inline Math:</div>
              <code className="block bg-gray-100 dark:bg-[#303030] p-2 rounded mb-2 text-xs font-mono border border-gray-200 dark:border-gray-700">
                $E = mc^2$
              </code>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Block Math:</div>
              <code className="block bg-gray-100 dark:bg-[#303030] p-2 rounded text-xs font-mono border border-gray-200 dark:border-gray-700">
                {"$$ x = \\frac{-b \\pm \\sqrt{4ac}}{2a} $$"}
              </code>
            </GuideSection>

            <GuideSection title="Tables" icon={<Table size={16} />}>
              <pre className="bg-gray-100 dark:bg-[#303030] p-2 rounded text-xs text-gray-700 dark:text-gray-300 font-mono border border-gray-200 dark:border-gray-700 whitespace-pre">
{`| Header | Header |
|--------|--------|
| Cell   | Cell   |`}
              </pre>
            </GuideSection>

             <GuideSection title="Extras" icon={<Image size={16} />}>
              <CodeExample code="---" label="Horizontal Divider" />
              <CodeExample code="[Title](url)" label="Link" />
              <CodeExample code="![Alt](image_url)" label="Image" />
              <CodeExample code="Line 1<br/>Line 2" label="Force Break" />
            </GuideSection>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GuideSection = ({ title, icon, children }) => (
  <div>
    <h4 className="font-bold text-gray-900 dark:text-[#A8C7FA] mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
      {icon} {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const CodeExample = ({ code, label }) => (
  <div className="font-mono text-xs">
    <div className="bg-gray-100 dark:bg-[#303030] p-2 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex justify-between">
      <span>{code}</span>
      {label && <span className="text-gray-400 select-none italic">{label}</span>}
    </div>
  </div>
);

// --- MARKDOWN RENDERER CONFIG ---
const MarkdownContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]} 
    rehypePlugins={[rehypeKatex]}
    components={{
      code({node, inline, className, children, ...props}) {
        const match = /language-(\w+)/.exec(className || '')
        return !inline && match ? (
          <CodeBlock language={match[1]} {...props}>{children}</CodeBlock>
        ) : (
          <code className="bg-gray-100 dark:bg-[#303030] px-1.5 py-0.5 rounded text-[#00639B] dark:text-[#A8C7FA] font-mono text-sm border border-gray-200 dark:border-[#444746]" {...props}>
            {children}
          </code>
        )
      },
      table: ({node, ...props}) => (
        <CopyWrapper type="Table">
          <table className="min-w-full" {...props} />
        </CopyWrapper>
      ),
      p: ({node, children, ...props}) => <p className="mb-4 leading-relaxed" {...props}>{children}</p>
    }}
  >
    {content}
  </ReactMarkdown>
);

// --- READ MODE ---
const NoteReader = ({ note, onEdit, onBack }) => {
  const titleRef = useRef(null);
  const [showNavbarTitle, setShowNavbarTitle] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowNavbarTitle(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" } 
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <FullScreenPortal>
      <div className="h-16 px-4 md:px-8 border-b border-gray-200 dark:border-[#444746] flex justify-between items-center bg-white dark:bg-[#1E1F20] z-50 relative transition-all duration-300">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-[#C4C7C5] dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#303030]">
            <ArrowLeft size={20} /> <span className="font-medium hidden sm:inline">Back</span>
          </button>
          <AnimatePresence>
            {showNavbarTitle && (
              <motion.h2 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="text-lg font-bold text-gray-800 dark:text-[#E3E3E3] truncate max-w-md hidden md:block"
              >
                {note.title || "Untitled"}
              </motion.h2>
            )}
          </AnimatePresence>
        </div>
        <Button onClick={onEdit} className="rounded-full px-6 bg-[#A8C7FA] text-[#003355] font-bold flex items-center gap-2">
          <Edit3 size={18} /> Edit Note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#131314]">
        <div className="max-w-3xl mx-auto py-12 px-8">
          <h1 ref={titleRef} className="text-5xl font-extrabold text-gray-900 dark:text-[#E3E3E3] mb-8 leading-tight">
            {note.title || "Untitled"}
          </h1>

          {/* TAGS DISPLAY */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex gap-2 mb-8 flex-wrap">
              {note.tags.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-[#A8C7FA] rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                  #{typeof t === 'string' ? t : t.name}
                </span>
              ))}
            </div>
          )}

          <hr className="border-gray-200 dark:border-[#444746] mb-10" />
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-[#C4C7C5]">
            <MarkdownContent content={note.content} />
          </div>
        </div>
      </div>
    </FullScreenPortal>
  );
};

// --- EDIT MODE (FIXED) ---
const NoteEditor = ({ note, onSave, onBack }) => {
  const [formData, setFormData] = useState({ 
    id: note?.id || null, 
    title: note?.title || '', 
    content: note?.content || '',
    tags: note?.tags?.map(t => (typeof t === 'string' ? t : t.name)) || [] 
  });

  const [editorMode, setEditorMode] = useState('split');
  const [zenMode, setZenMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [showGuide, setShowGuide] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const titleInputRef = useRef(null);
  const [showNavbarTitle, setShowNavbarTitle] = useState(false);

  // Auto-Save Logic (Fixed)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (saveStatus === 'unsaved') {
        // Prevent saving if title AND content are empty
        if (!formData.title.trim() && !formData.content.trim()) {
            setSaveStatus('saved'); 
            return;
        }

        setSaveStatus('saving');
        try {
            const savedNote = await onSave(formData);
            
            // CRITICAL FIX: If we just created a new note, update local state with the new ID
            if (savedNote && savedNote.id && !formData.id) {
                setFormData(prev => ({ ...prev, id: savedNote.id }));
            }
            setSaveStatus('saved');
        } catch (error) {
            console.error("Auto-save failed", error);
            setSaveStatus('error');
        }
      }
    }, 1500); 
    return () => clearTimeout(timer);
  }, [formData, saveStatus, onSave]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowNavbarTitle(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    if (titleInputRef.current) observer.observe(titleInputRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('unsaved');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        handleChange('tags', [...formData.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleExport = (format) => {
    const filename = formData.title || 'note';
    if (format === 'pdf') {
      window.print();
    } else {
      const ext = format === 'md' ? 'md' : 'txt';
      const content = formData.content; 
      const blob = new Blob([content], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${ext}`;
      a.click();
    }
    setExportOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSave = async () => { 
      // Prevent manual save of empty note
      if (!formData.title.trim() && !formData.content.trim()) return;
      await onSave(formData); 
  };

  return (
    <FullScreenPortal>
      {/* Toolbar */}
      {!zenMode && (
        <div className="h-16 px-4 md:px-6 border-b border-gray-200 dark:border-[#444746] flex justify-between items-center bg-white dark:bg-[#1E1F20] shadow-sm z-50">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#303030] text-gray-500 dark:text-[#C4C7C5] transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-[#444746] hidden md:block"></div>
            
            <span className="text-xs text-gray-400 font-mono hidden sm:block">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Unsaved' : saveStatus === 'error' ? 'Error' : 'Saved'}
            </span>

            <AnimatePresence mode="wait">
              {showNavbarTitle ? (
                <motion.span key="sticky" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-sm font-bold text-gray-800 dark:text-[#E3E3E3] truncate max-w-xs ml-4">
                  {formData.title || "Untitled"}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-[#303030] rounded-lg p-1 mr-2">
              <button 
                onClick={() => setEditorMode('raw')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${editorMode === 'raw' ? 'bg-white dark:bg-[#1E1F20] shadow text-indigo-600 dark:text-[#A8C7FA]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="Normal Text Mode"
              >
                <FileText size={16} /> Text
              </button>
              <button 
                onClick={() => setEditorMode('split')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${editorMode === 'split' ? 'bg-white dark:bg-[#1E1F20] shadow text-indigo-600 dark:text-[#A8C7FA]' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                title="Markdown Split View"
              >
                <Columns size={16} /> MD
              </button>
            </div>

            <button onClick={() => setZenMode(true)} className="p-2 text-gray-500 hover:text-indigo-500 dark:text-[#C4C7C5] dark:hover:text-[#A8C7FA]" title="Zen Mode"><Maximize size={18} /></button>
            
            <div className="relative">
                <button onClick={() => setExportOpen(!exportOpen)} className="p-2 text-gray-500 hover:text-indigo-500 dark:text-[#C4C7C5] dark:hover:text-[#A8C7FA]" title="Export"><Download size={18} /></button>
                <AnimatePresence>{exportOpen && <ExportMenu onExport={handleExport} />}</AnimatePresence>
            </div>

            <button onClick={() => setShowGuide(!showGuide)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${showGuide ? 'bg-indigo-50 text-indigo-600 dark:bg-[#003355] dark:text-[#A8C7FA]' : 'text-gray-500 dark:text-[#C4C7C5] hover:bg-gray-100 dark:hover:bg-[#303030]'}`}><HelpCircle size={18} /> <span className="hidden sm:inline">Guide</span></button>
            <button onClick={handleCopy} className="p-2 rounded-lg text-gray-500 dark:text-[#C4C7C5] hover:text-[#A8C7FA] hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors" title="Copy Full Text">
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>

            <div className="h-6 w-px bg-gray-300 dark:bg-[#444746] mx-2"></div>

            <Button onClick={() => { handleManualSave(); onBack(); }} className="rounded-full px-6 bg-[#A8C7FA] text-[#003355] font-bold shadow-lg shadow-indigo-500/10">
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Zen Mode Exit Button */}
      {zenMode && (
        <button onClick={() => setZenMode(false)} className="absolute top-6 right-6 z-[60] p-3 bg-gray-100 dark:bg-[#303030] rounded-full text-gray-600 dark:text-[#E3E3E3] hover:scale-110 transition-transform shadow-lg"><Minimize size={20}/></button>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Input Area */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${editorMode === 'split' && !zenMode ? 'w-1/2 border-r border-gray-200 dark:border-[#444746]' : 'w-full mx-auto max-w-4xl'}`}>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#131314] p-8 md:p-12">
            <div className={`mx-auto ${editorMode === 'split' ? 'max-w-2xl' : 'max-w-3xl'}`}>
              
              <div ref={titleInputRef}>
                <input 
                  placeholder="Untitled" 
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className={`w-full text-4xl md:text-5xl font-bold text-gray-900 dark:text-[#E3E3E3] border-none focus:ring-0 p-0 bg-transparent mb-4 placeholder-gray-300 dark:placeholder-[#444746] ${editorMode === 'raw' ? 'font-sans' : ''}`}
                />
              </div>

              {/* Tags Input */}
              <div className="flex flex-wrap gap-2 mb-8 items-center">
                {formData.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-xs font-mono flex items-center gap-1 text-indigo-600 dark:text-[#A8C7FA] border border-indigo-100 dark:border-indigo-800">
                    #{tag} <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
                <div className="relative flex items-center">
                  <Tag size={14} className="absolute left-2 text-gray-400"/>
                  <input 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add tag..."
                    className="pl-7 py-1 text-sm bg-transparent border border-gray-200 dark:border-[#444746] rounded-full w-28 focus:w-40 transition-all focus:border-indigo-500 focus:ring-0 text-gray-600 dark:text-gray-300 placeholder-gray-400"
                  />
                </div>
              </div>

              <textarea 
                placeholder={editorMode === 'split' ? "Type Markdown here..." : "Start writing..."}
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                className={`w-full h-[calc(100vh-250px)] resize-none border-none focus:ring-0 p-0 bg-transparent text-lg leading-relaxed text-gray-700 dark:text-[#C4C7C5] custom-caret ${editorMode === 'split' ? 'font-mono' : 'font-sans'}`}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Preview Area (Only visible in Split Mode) */}
        <AnimatePresence>
          {!zenMode && editorMode === 'split' && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: '50%' }} exit={{ opacity: 0, width: 0 }} className="hidden lg:block bg-[#F8FAFC] dark:bg-[#0E0E0E] overflow-y-auto custom-scrollbar">
              <div className="p-12 prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                <h1 className="mb-8 pb-4 border-b border-gray-200 dark:border-[#444746] opacity-50">{formData.title || "Untitled"}</h1>
                <MarkdownContent content={formData.content} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <MarkdownGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      </div>
    </FullScreenPortal>
  );
};

// --- LIST MODE ---
const NoteCard = ({ note, onClick, onDelete }) => (
  <motion.div layout whileHover={{ y: -4 }} onClick={() => onClick(note)} className="group bg-white dark:bg-[#1E1F20] p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-[#444746] cursor-pointer relative h-64 overflow-hidden flex flex-col">
    <div className="flex justify-between items-start mb-3">
      <h3 className="font-bold text-lg text-gray-800 dark:text-[#E3E3E3] truncate pr-6">{note.title || 'Untitled'}</h3>
      <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
    </div>
    {note.tags && note.tags.length > 0 && (
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {note.tags.slice(0, 3).map((t, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-[#303030] text-gray-500 dark:text-gray-400 rounded-full border border-gray-200 dark:border-[#444746]">#{typeof t === 'string' ? t : t.name}</span>)}
      </div>
    )}
    <div className="flex-1 overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
       <div className="text-sm text-gray-500 dark:text-[#C4C7C5] line-clamp-5 font-mono whitespace-pre-wrap">{note.content}</div>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-[#1E1F20] to-transparent pointer-events-none" />
  </motion.div>
);

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [mode, setMode] = useState('list');

  const load = () => notesApi.getAll().then(setNotes);
  useEffect(() => { load(); }, []);

  const handleSave = async (noteData) => {
    // 1. Prevent saving if completely empty and no ID (prevents "ghost" notes)
    if (!noteData.id && !noteData.title.trim() && !noteData.content.trim()) {
        return null;
    }

    if (noteData.id) {
        await notesApi.update(noteData.id, noteData);
        setNotes(prev => prev.map(n => n.id === noteData.id ? { ...n, ...noteData } : n));
        return noteData; // Return existing note
    } else {
        const newNote = await notesApi.create(noteData);
        setNotes(prev => [newNote, ...prev]);
        return newNote; // Return NEW note so Editor can capture the ID
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this note?')) { await notesApi.delete(id); load(); }
  };

  return (
    <>
      <div className={`${mode === 'list' ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Notes</h1><p className="text-gray-500 dark:text-[#C4C7C5]">Knowledge Base</p></div>
          <Button onClick={() => { setSelectedNote(null); setMode('edit'); }} className="rounded-xl bg-[#A8C7FA] text-[#003355]"><Plus size={20} className="mr-2" /> New Note</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {notes.map(note => <NoteCard key={note.id} note={note} onClick={(n) => { setSelectedNote(n); setMode('read'); }} onDelete={handleDelete} />)}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {mode === 'read' && selectedNote && <NoteReader note={selectedNote} onBack={() => setMode('list')} onEdit={() => setMode('edit')} />}
        {mode === 'edit' && <NoteEditor note={selectedNote} onBack={() => { load(); setMode('list'); }} onSave={handleSave} />}
      </AnimatePresence>
    </>
  );
};

export default NotesPage;