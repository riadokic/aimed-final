import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-aimed-accent text-white hover:bg-aimed-accent-hover dark:bg-white dark:text-[#09090B] dark:hover:bg-[#E4E4E7]",
  secondary: "bg-aimed-white text-aimed-black border border-aimed-gray-200 hover:bg-aimed-gray-50 hover:border-aimed-gray-400",
  ghost: "text-aimed-gray-500 hover:text-aimed-black hover:bg-aimed-gray-100",
  danger: "bg-aimed-red text-white hover:bg-red-700",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export function Button({ variant = "primary", size = "md", className, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-300",
        "disabled:pointer-events-none disabled:opacity-40",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
