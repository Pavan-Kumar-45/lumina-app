import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;