import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import LoginPage from '../../pages/auth/LoginPage';
import DashboardPage from '../../pages/DashboardPage';
import TodosPage from '../../pages/TodosPage';
import DiaryPage from '../../pages/DiaryPage';
import NotesPage from '../../pages/NotesPage';
import GoalsPage from '../../pages/GoalsPage';
import SettingsPage from '../../pages/SettingsPage';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, token } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#131314]">
        <div className="loader mb-4"></div>
        <div className="text-[#E3E3E3] font-medium tracking-wide">Loading Lumina...</div>
      </div>
    );
  }

  if (!token) return <LoginPage onLoginSuccess={() => {}} />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentPage} />;
      case 'todos': return <TodosPage />;
      case 'diary': return <DiaryPage />;
      case 'notes': return <NotesPage />;
      case 'goals': return <GoalsPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen relative">
      <div className="app-background" />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;