import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  inputClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, inputClassName, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-[12px] mb-2 text-grey-500 font-bold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-4 py-2 bg-[#1E293B] border border-[#334155] rounded text-white placeholder:text-[#475569]",
            inputClassName
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error.message}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"; 