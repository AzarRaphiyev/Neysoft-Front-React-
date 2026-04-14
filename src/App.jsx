import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider, UIProvider, useUI } from './contexts';
import { Sidebar, Header, Toast, ConfirmDialog } from './components';
import Dashboard from './pages/Dashboard';
import UmumiAnbar from './pages/anbar/UmumiAnbar';
import Satis from './pages/Satis';
import SatisTarixce from './pages/SatisTarixce';
import Maliyye from './pages/maliyye/Maliyye';
import Parametrler from './pages/Parametrler';
import './styles/global.css';

function AppContent() {
  const { toast, hideToast, confirmDialog, handleConfirm, handleCancel } = useUI();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto main-content pt-16 md:pt-6 md:ml-0">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/anbar" element={<UmumiAnbar />} />
          <Route path="/satis" element={<Satis />} />
          <Route path="/satis-tarixce" element={<SatisTarixce />} />
          <Route path="/maliyye" element={<Maliyye />} />
          <Route path="/parametrler" element={<Parametrler />} />
        </Routes>
      </main>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={confirmDialog?.title || ''}
        message={confirmDialog?.message || ''}
      />
    </div>
  );
}

function App() {
  return (
    <UIProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </UIProvider>
  );
}

export default App;
