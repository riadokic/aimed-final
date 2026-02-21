import { cn } from "@/lib/utils";

type CardVariant = "default" | "dark" | "interactive";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border border-aimed-gray-200 bg-aimed-white transition-all duration-300 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]",
  dark: "bg-aimed-accent text-white border-0 transition-all duration-300 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]",
  interactive: "border border-aimed-gray-200 bg-aimed-white hover:border-aimed-gray-400 cursor-pointer transition-all duration-300 dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]",
};

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div className={cn("rounded-3xl p-6", variantStyles[variant], className)}>
      {children}
    </div>
  );
}
