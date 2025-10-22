import { useNotification } from "@/hooks/useNotification";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export function NotificationContainer() {
  const { notifications } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" data-testid="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
            animate-in slide-in-from-top-5 fade-in duration-300
            min-w-[300px] max-w-md
            ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800' : ''}
          `}
          data-testid={`notification-${notification.type}`}
        >
          {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
          {notification.type === 'info' && <Info className="h-5 w-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
