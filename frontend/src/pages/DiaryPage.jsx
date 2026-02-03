import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { diariesApi } from '../api/diaries';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useClickOutside } from '../hooks/useModal';
import DateNavigator from '../components/common/DateNavigator';
import DiaryDashboard from '../components/features/diary/DiaryDashboard';
import DiaryEditor from '../components/features/diary/DiaryEditor';

const DiaryPage = () => {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('dashboard');
  const [currentEntry, setCurrentEntry] = useState(null);
  const { date, setDate, nextDay, previousDay } = useDateNavigation();

  const loadEntries = async () => {
    try {
      const data = await diariesApi.getByDate(date);
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading diary entries:', err);
      setEntries([]);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [date]);

  const handleSave = async (entryData) => {
    const payload = { 
      ...entryData, 
      entry_datetime: new Date().toISOString() 
    };
    try {
      if (entryData.id) {
        await diariesApi.update(entryData.id, payload);
      } else {
        await diariesApi.create(payload);
      }
      await loadEntries();
      setView('dashboard');
    } catch (err) {
      console.error('Error saving diary entry:', err);
      throw err;
    }
  };

  const handleSelectEntry = (entry) => {
    setCurrentEntry(entry);
    setView('editor');
  };

  const handleNewEntry = () => {
    setCurrentEntry(null);
    setView('editor');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setCurrentEntry(null);
  };

  return (
    <div className="h-full flex flex-col">
      {view === 'dashboard' && (
        <div className="mb-8 flex justify-end">
          <DateNavigator
            date={date}
            onDateChange={setDate}
            onNextDay={nextDay}
            onPreviousDay={previousDay}
          />
        </div>
      )}

      {view === 'dashboard' ? (
        <DiaryDashboard 
          entries={entries}
          selectedDate={date}
          onSelectEntry={handleSelectEntry}
          onNewEntry={handleNewEntry}
        />
      ) : (
        <DiaryEditor 
          entry={currentEntry}
          date={date}
          onBack={handleBackToDashboard}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DiaryPage;