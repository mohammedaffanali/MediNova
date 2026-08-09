import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AIAssistantPanel } from './AIAssistantPanel';
import { NotificationPanel } from './NotificationPanel';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from './ToastContainer';
import { useDataStore } from '@/store/dataStore';
import FuturisticBg from './FuturisticBg';

export function AppLayout() {
  const init = useDataStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex h-screen overflow-hidden text-ink-200">
      <FuturisticBg />
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-6"
            >
              <Outlet />
            </motion.div>
          </main>
          <AIAssistantPanel />
        </div>
      </div>
      <NotificationPanel />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
