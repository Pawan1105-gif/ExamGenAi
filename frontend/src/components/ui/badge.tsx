import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]",
        className
      )}
      {...props}
    />
  );
}
