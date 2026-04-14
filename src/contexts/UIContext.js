import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openModal = useCallback((modalName, data = null) => {
    setActiveModal(modalName);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showConfirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmDialog({ title, message, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(true);
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  const handleCancel = useCallback(() => {
    if (confirmDialog?.resolve) {
      confirmDialog.resolve(false);
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        closeSidebar,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toast,
        showToast,
        hideToast,
        confirmDialog,
        showConfirm,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}
