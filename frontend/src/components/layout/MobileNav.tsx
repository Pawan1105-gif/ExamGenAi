import { NavLink } from "react-router-dom";
import { BookOpen, LayoutDashboard, Sparkles, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/app/generator", icon: Sparkles, label: "AI" },
  { to: "/app/exams", icon: BookOpen, label: "Exams" },
  { to: "/app/profile", icon: UserCircle, label: "Me" },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[var(--color-card-border)] bg-[var(--color-card)]/85 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] font-medium",
              isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]"
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
