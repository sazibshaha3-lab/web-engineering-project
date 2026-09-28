import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import "./Toast.css";

const ToastContext = createContext(null);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, tone = "info", action = null) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, action ? 5000 : 4000);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icons[t.tone] || Info;
          return (
            <div key={t.id} className={`toast toast--${t.tone}`}>
              <Icon size={18} strokeWidth={2} />
              <span>{t.message}</span>
              {t.action && (
                <button
                  className="toast__action"
                  onClick={() => {
                    t.action.onClick?.();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
