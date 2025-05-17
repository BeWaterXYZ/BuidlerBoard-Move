import { useEffect } from "react";
import { useToastStore } from "./store";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

const icons = {
  success: <CheckCircledIcon className="w-5 h-5 text-green-500" />,
  error: <CrossCircledIcon className="w-5 h-5 text-red-500" />,
  warning: <CrossCircledIcon className="w-5 h-5 text-yellow-500" />,
};

export function Toast() {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        remove(toasts[0].id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "flex items-center gap-2 p-4 rounded-lg shadow-lg bg-[#1E293B] text-white min-w-[300px]",
            "animate-in slide-in-from-right"
          )}
        >
          {icons[toast.type]}
          <div>
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm text-gray-400">{toast.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 