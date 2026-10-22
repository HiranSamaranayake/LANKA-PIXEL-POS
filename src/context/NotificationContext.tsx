import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Trash2,
  Loader2,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

export interface ConfirmDeleteOptions {
  title: string;
  message: string;
  itemName?: string;
  itemDetails?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  confirmDelete: (options: ConfirmDeleteOptions) => void;
  closeConfirm: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<(ConfirmDeleteOptions & { isOpen: boolean; isProcessing: boolean }) | null>(null);

  // Keep ref to avoid stale timer closures
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, title };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep maximum 4 concurrent toasts

      const timer = setTimeout(() => {
        removeToast(id);
      }, 4500);

      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );
  const showError = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title),
    [showToast]
  );
  const showWarning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title),
    [showToast]
  );
  const showInfo = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );

  const confirmDelete = useCallback((options: ConfirmDeleteOptions) => {
    setConfirmModal({
      ...options,
      isOpen: true,
      isProcessing: false,
    });
  }, []);

  const closeConfirm = useCallback(() => {
    if (confirmModal?.isProcessing) return; // Prevent closing while processing
    setConfirmModal(null);
  }, [confirmModal]);

  const handleModalConfirm = async () => {
    if (!confirmModal || confirmModal.isProcessing) return;

    setConfirmModal((prev) => (prev ? { ...prev, isProcessing: true } : null));
    try {
      await confirmModal.onConfirm();
      setConfirmModal(null);
    } catch {
      // Re-enable buttons if operation failed so user can cancel or retry
      setConfirmModal((prev) => (prev ? { ...prev, isProcessing: false } : null));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        confirmDelete,
        closeConfirm,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          let icon = <Info className="h-4 w-4 text-[#2563EB]" />;
          let iconBg = 'bg-[#EFF6FF] border-[#BFDBFE]';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
            iconBg = 'bg-emerald-50 border-emerald-200';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="h-4 w-4 text-red-600" />;
            iconBg = 'bg-red-50 border-red-200';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="h-4 w-4 text-amber-600" />;
            iconBg = 'bg-amber-50 border-amber-200';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className="pointer-events-auto bg-white rounded-xl border border-[#E5E7EB] shadow-lg p-3.5 flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className={`p-1.5 rounded-lg border shrink-0 ${iconBg}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                {toast.title && (
                  <h5 className="text-xs font-bold text-[#111827] mb-0.5">
                    {toast.title}
                  </h5>
                )}
                <p className="text-xs text-gray-700 font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Professional Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    confirmModal.isDestructive !== false
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-blue-50 text-[#2563EB] border-blue-100'
                  }`}
                >
                  {confirmModal.isDestructive !== false ? (
                    <Trash2 className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#111827]">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>
              </div>

              {/* Identified Item Summary Box */}
              {(confirmModal.itemName || confirmModal.itemDetails) && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-[#E5E7EB] text-xs">
                  {confirmModal.itemName && (
                    <div className="font-bold text-[#111827] truncate">
                      {confirmModal.itemName}
                    </div>
                  )}
                  {confirmModal.itemDetails && (
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {confirmModal.itemDetails}
                    </div>
                  )}
                </div>
              )}

              {/* Notice text */}
              {confirmModal.isDestructive !== false && (
                <p className="text-[11px] text-red-600 font-medium mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  This action cannot be undone.
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 sm:px-6 py-3.5 bg-gray-50 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={confirmModal.isProcessing}
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={confirmModal.isProcessing}
                onClick={handleModalConfirm}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 ${
                  confirmModal.isDestructive !== false
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                }`}
              >
                {confirmModal.isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmModal.confirmText || 'Delete'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
