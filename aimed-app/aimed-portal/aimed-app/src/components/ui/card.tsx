import { cn } from "@/lib/utils";

type CardVariant = "default" | "dark" | "interactive";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: "border border-aimed-gray-200 bg-aimed-white",
  dark: "bg-aimed-accent text-white border-0",
  interactive: "border border-aimed-gray-200 bg-aimed-white hover:border-aimed-gray-400 cursor-pointer",
};

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div className={cn("rounded-2xl p-6", variantStyles[variant], className)}>
      {children}
    </div>
  );
}
