import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/generator", label: "AI Generator", icon: Sparkles },
  { to: "/app/exams", label: "My Exams", icon: BookOpen },
  { to: "/app/quiz/join", label: "Join Quiz", icon: ClipboardList },
  { to: "/app/profile", label: "Profile", icon: UserCircle },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <aside className="glass-panel flex h-full w-64 shrink-0 flex-col rounded-2xl p-4">
      <div className="mb-8 flex items-center gap-3 px-2">
        <motion.div
          className="neo-surface flex h-11 w-11 items-center justify-center rounded-xl"
          whileHover={{ rotate: [0, -4, 4, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold tracking-tight">ExamGen AI</p>
          <p className="text-xs text-[var(--color-muted)]">Studio</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-foreground)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
        {user?.role === "ADMIN" && (
          <>
            <NavLink
              to="/app/quiz"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-500/20 text-purple-200"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card)]"
                )
              }
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              Manage Quizzes
            </NavLink>
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card)]"
                )
              }
            >
              <Home className="h-4 w-4 shrink-0" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-4 space-y-2 border-t border-[var(--color-card-border)] pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={toggle}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
