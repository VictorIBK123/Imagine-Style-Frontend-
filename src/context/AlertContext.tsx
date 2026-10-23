import React, { createContext, useContext, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal, AlertType, AlertButton } from '@/components/ui/alert-modal';

export interface AlertConfig {
  title: string;
  message?: string;
  type?: AlertType;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: AlertButton[];
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

interface AlertContextValue {
  showAlert: (
    titleOrOptions: string | AlertConfig,
    message?: string,
    buttons?: AlertButton[]
  ) => void;
  showConfirm: (options: {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  showSuccess: (title: string, message?: string, onConfirm?: () => void) => void;
  showError: (title: string, message?: string, onConfirm?: () => void) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const hideAlert = useCallback(() => {
    setVisible(false);
    // Clear config after exit animation
    setTimeout(() => {
      setConfig(null);
    }, 200);
  }, []);

  const showAlert = useCallback(
    (
      titleOrOptions: string | AlertConfig,
      message?: string,
      buttons?: AlertButton[]
    ) => {
      if (typeof titleOrOptions === 'object') {
        setConfig(titleOrOptions);
      } else {
        setConfig({
          title: titleOrOptions,
          message,
          buttons,
        });
      }
      setVisible(true);
    },
    []
  );

  const showConfirm = useCallback(
    (options: {
      title: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
      icon?: keyof typeof Ionicons.glyphMap;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      setConfig({
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        destructive: options.destructive,
        icon: options.icon,
        type: options.destructive ? 'destructive' : 'confirm',
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
      setVisible(true);
    },
    []
  );

  const showSuccess = useCallback((title: string, message?: string, onConfirm?: () => void) => {
    setConfig({
      title,
      message,
      type: 'success',
      onConfirm,
    });
    setVisible(true);
  }, []);

  const showError = useCallback((title: string, message?: string, onConfirm?: () => void) => {
    setConfig({
      title,
      message,
      type: 'warning',
      onConfirm,
    });
    setVisible(true);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showConfirm,
        showSuccess,
        showError,
        hideAlert,
      }}>
      {children}
      {config && (
        <AlertModal
          visible={visible}
          onClose={hideAlert}
          title={config.title}
          message={config.message}
          type={config.type}
          icon={config.icon}
          buttons={config.buttons}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          onConfirm={config.onConfirm}
          onCancel={config.onCancel}
          destructive={config.destructive}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}
