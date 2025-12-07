import React, { useState, useEffect } from 'react';
import { Moon, Sun, AlertTriangle, RefreshCw, User, Shield, Bell, Check, X, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import { usersApi } from '../api/users';
import { todosApi } from '../api/todos'; 
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal'; 

const SettingsPage = () => {
  const { currentUser, refreshCurrentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isRolloverEnabled, setIsRolloverEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [loading, setLoading] = useState({ 
    username: false, email: false, password: false, delete: false, 
    rollover: false, notify: false, otp: false, verify: false 
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setIsRolloverEnabled(currentUser.rollover || false);
      setIsNotificationsEnabled(currentUser.notifications_enabled || false);
      setIsEmailVerified(currentUser.email_validated || false);
    }
  }, [currentUser]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // --- ACCOUNT HANDLERS ---
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, username: true });
    try {
      await usersApi.updateUsername(username);
      await refreshCurrentUser();
      showMsg('success', 'Username updated');
    } catch (err) { showMsg('error', err.message); } 
    finally { setLoading({ ...loading, username: false }); }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, email: true });
    try {
      await usersApi.updateEmail(email);
      await refreshCurrentUser();
      setIsEmailVerified(false); 
      setIsNotificationsEnabled(false); 
      showMsg('success', 'Email updated. Please verify again.');
    } catch (err) { showMsg('error', err.message); } 
    finally { setLoading({ ...loading, email: false }); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, password: true });
    try {
      await usersApi.updatePassword(password);
      setPassword('');
      showMsg('success', 'Password updated');
    } catch (err) { showMsg('error', err.message); } 
    finally { setLoading({ ...loading, password: false }); }
  };

  // --- FEATURE HANDLERS ---
  const toggleRollover = async () => {
    const newValue = !isRolloverEnabled;
    setIsRolloverEnabled(newValue); 
    try {
      await usersApi.updateRollover(newValue);
      await refreshCurrentUser();
    } catch (err) {
      setIsRolloverEnabled(!newValue);
      showMsg('error', 'Failed to update rollover');
    }
  };

  const handleManualRollover = async () => {
    setLoading({ ...loading, rollover: true });
    try {
      await todosApi.rollover();
      showMsg('success', 'Tasks rolled over!');
    } catch (err) { showMsg('error', 'Rollover failed'); } 
    finally { setLoading({ ...loading, rollover: false }); }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? This is permanent.')) {
      setLoading({ ...loading, delete: true });
      try {
        await usersApi.deleteAccount();
        logout();
      } catch (err) { showMsg('error', err.message); setLoading({ ...loading, delete: false }); }
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleToggleNotifications = async () => {
    // 1. If user is trying to ENABLE (currently false) AND email is NOT verified
    if (!isNotificationsEnabled && !isEmailVerified) {
      setShowVerifyModal(true); // Force modal open
      return; // STOP here. Don't call API.
    }

    // 2. Optimistic Update
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue); 
    setLoading({ ...loading, notify: true });
    
    try {
      if (newValue) {
        await usersApi.updateNotifications(true);
      } else {
        await usersApi.disableNotifications();
      }
      await refreshCurrentUser();
      showMsg('success', `Notifications ${newValue ? 'Enabled' : 'Disabled'}`);
    } catch (err) {
      // 3. Revert on Error
      setIsNotificationsEnabled(!newValue); 
      showMsg('error', err.message || "Failed to update settings");
    } finally {
      setLoading({ ...loading, notify: false });
    }
  };

  // --- VERIFICATION FLOW ---
  const openVerifyModal = () => {
    setOtp('');
    setOtpSent(false);
    setShowVerifyModal(true);
  };

  const sendOtp = async () => {
    setLoading({ ...loading, otp: true });
    try {
      await usersApi.sendValidationCode();
      setOtpSent(true);
      showMsg('success', 'Code sent to your email!');
    } catch (err) {
      showMsg('error', err.message || 'Failed to send code.');
    } finally {
      setLoading({ ...loading, otp: false });
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, verify: true });
    try {
      // API call to backend
      await usersApi.validateEmail(email, otp);
      
      // If successful:
      await refreshCurrentUser();
      setIsEmailVerified(true);
      
      // Auto-enable notifications on success
      await usersApi.updateNotifications(true); 
      setIsNotificationsEnabled(true);
      
      setShowVerifyModal(false);
      showMsg('success', 'Verified! Reminders enabled.');
    } catch (err) {
      // Show the ACTUAL backend error message (e.g., "Invalid verification code")
      console.error("Verification Failed:", err);
      showMsg('error', err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading({ ...loading, verify: false });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-[#E3E3E3]">Settings</h1>
        <p className="text-gray-500 dark:text-[#C4C7C5]">Manage your account and preferences</p>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300'}`}
          >
            {message.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PREFERENCES --- */}
      <Card className="p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mb-6 flex items-center gap-2">
          <RefreshCw size={20} className="text-[#A8C7FA]" /> General
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#303030]">
            <div><p className="font-medium text-gray-900 dark:text-[#E3E3E3]">Theme</p><p className="text-sm text-gray-500 dark:text-[#C4C7C5]">Look & Feel</p></div>
            <div className="flex gap-2 bg-white dark:bg-[#1E1F20] p-1 rounded-lg border border-gray-200 dark:border-[#444746]">
              <button onClick={() => setTheme('light')} className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400'}`}><Sun size={20} /></button>
              <button onClick={() => setTheme('dark')} className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-[#303030] text-[#A8C7FA] shadow-sm' : 'text-gray-400'}`}><Moon size={20} /></button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#303030]">
             <div><p className="font-medium text-gray-900 dark:text-[#E3E3E3]">Auto Rollover</p><p className="text-sm text-gray-500 dark:text-[#C4C7C5]">Move incomplete tasks</p></div>
             <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isRolloverEnabled} onChange={toggleRollover} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#A8C7FA]"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* --- NOTIFICATIONS --- */}
      <Card className="p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mb-6 flex items-center gap-2">
          <Bell size={20} className="text-[#A8C7FA]" /> Notifications
        </h2>

        <div className="space-y-4">
            {/* ROW 1: Verification Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#303030]">
                <div>
                    <p className="font-medium text-gray-900 dark:text-[#E3E3E3]">Email Status</p>
                    <p className="text-sm text-gray-500 dark:text-[#C4C7C5]">Required for reminders</p>
                </div>
                {isEmailVerified ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium">
                        <Check size={16} /> Verified
                    </div>
                ) : (
                    <Button onClick={openVerifyModal} size="sm" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800">
                        Verify Now
                    </Button>
                )}
            </div>

            {/* ROW 2: Toggle */}
            <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-100 dark:border-[#303030] ${!isEmailVerified ? 'opacity-60' : ''}`}>
                <div>
                    <div className="flex items-center gap-2">
                         <p className="font-medium text-gray-900 dark:text-[#E3E3E3]">Daily Reminders</p>
                         {!isEmailVerified && <Lock size={14} className="text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-[#C4C7C5]">Get task summaries at 8 AM & 6 PM</p>
                </div>
                
                <label className={`relative inline-flex items-center ${isEmailVerified ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input 
                        type="checkbox" 
                        checked={isNotificationsEnabled} 
                        onChange={handleToggleNotifications} 
                        disabled={loading.notify} 
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#A8C7FA]"></div>
                </label>
            </div>
        </div>
      </Card>

      {/* --- ACCOUNT --- */}
      <Card className="p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mb-6 flex items-center gap-2">
          <User size={20} className="text-[#A8C7FA]" /> Account
        </h2>
        <div className="space-y-6">
          <form onSubmit={handleUpdateUsername} className="flex gap-4 items-end">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button type="submit" loading={loading.username} className="mb-0.5 bg-[#A8C7FA] text-[#003355]">Update</Button>
          </form>
          <form onSubmit={handleUpdateEmail} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" loading={loading.email} className="mb-0.5 bg-[#A8C7FA] text-[#003355]">Update</Button>
          </form>
        </div>
      </Card>

      {/* --- SECURITY & DANGER --- */}
      <Card className="p-6 bg-white dark:bg-[#1E1F20] dark:border-[#444746]">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E3E3E3] mb-6 flex items-center gap-2">
          <Shield size={20} className="text-[#A8C7FA]" /> Security
        </h2>
        <form onSubmit={handleUpdatePassword} className="flex gap-4 items-end">
          <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" loading={loading.password} className="mb-0.5 bg-[#A8C7FA] text-[#003355]">Change</Button>
        </form>
      </Card>

      <Card className="p-6 border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} /> Danger Zone
        </h2>
        <Button variant="danger" onClick={handleDeleteAccount} loading={loading.delete}>Delete Account</Button>
      </Card>

      {/* --- VERIFICATION MODAL --- */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Verify Email">
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full h-fit"><Mail size={20} className="text-indigo-600 dark:text-indigo-300" /></div>
             <div>
               <h4 className="font-bold text-gray-800 dark:text-[#E3E3E3] text-sm">One-Time Password</h4>
               <p className="text-xs text-gray-600 dark:text-[#C4C7C5] mt-1">We will send a code to <b>{email}</b> to verify ownership.</p>
             </div>
          </div>

          {!otpSent ? (
            <div className="text-center py-2">
              <Button onClick={sendOtp} loading={loading.otp} className="w-full bg-[#A8C7FA] text-[#003355] font-bold py-3 rounded-xl">Send Code</Button>
            </div>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#C4C7C5] mb-1">Enter 6-Digit Code</label>
                <input 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="w-full text-center text-2xl tracking-widest font-mono py-3 rounded-xl border border-gray-300 dark:border-[#444746] bg-transparent focus:ring-2 focus:ring-[#A8C7FA] dark:text-[#E3E3E3]" 
                  placeholder="000000" 
                  maxLength={6}
                />
              </div>
              <Button type="submit" loading={loading.verify} className="w-full bg-[#A8C7FA] text-[#003355] font-bold py-3 rounded-xl">Verify & Enable</Button>
              <button type="button" onClick={sendOtp} className="w-full text-center text-xs text-indigo-500 hover:underline">Resend Code</button>
            </form>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default SettingsPage;