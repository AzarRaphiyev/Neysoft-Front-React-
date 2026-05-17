import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { DataProvider, UIProvider, useUI } from './contexts';
import { Sidebar, Header, Toast, ConfirmDialog } from './components';
import Dashboard from './pages/Dashboard';
import UmumiAnbar from './pages/anbar/UmumiAnbar';
import Satis from './pages/Satis';
import SatisTarixce from './pages/SatisTarixce';
import MusteriIadeleri from './pages/MusteriIadeleri';
import Maliyye from './pages/maliyye/Maliyye';
import Parametrler from './pages/Parametrler';
import Login from './pages/Login';
import './styles/global.css';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

import Istifadeciler from './pages/Istifadeciler';

function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const { toast, hideToast, confirmDialog, handleConfirm, handleCancel } = useUI();

  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) { }
  const role = user?.role || 'GUEST';

  const isCashier = role === 'CASHIER';

  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes wrapped in MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={isCashier ? <Navigate to="/satis" replace /> : <Dashboard />} />
            <Route path="/anbar" element={<UmumiAnbar />} />
            <Route path="/satis" element={<Satis />} />
            <Route path="/satis-tarixce" element={<SatisTarixce />} />
            <Route path="/musteri-iadeleri" element={<MusteriIadeleri />} />
            <Route path="/maliyye" element={isCashier ? <Navigate to="/satis" replace /> : <Maliyye />} />
            <Route path="/parametrler" element={isCashier ? <Navigate to="/satis" replace /> : <Parametrler />} />
            <Route path="/users" element={['ADMIN', 'MANAGER'].includes(role) ? <Istifadeciler /> : <Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>

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
    </>
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
