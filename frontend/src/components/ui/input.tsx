import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-4 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
