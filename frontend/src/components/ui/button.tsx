import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionOverlap = Extract<
  keyof ButtonHTMLAttributes<HTMLButtonElement>,
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
>;

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionOverlap> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", disabled, children, ...props },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          variant === "primary" &&
            "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-lg shadow-[var(--color-glow)]",
          variant === "ghost" &&
            "glass-panel text-[var(--color-foreground)] hover:bg-[var(--color-card)]",
          variant === "outline" &&
            "border border-[var(--color-card-border)] bg-transparent hover:glass-panel",
          variant === "danger" &&
            "bg-red-600/90 text-white hover:bg-red-600 dark:bg-red-500/90",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
