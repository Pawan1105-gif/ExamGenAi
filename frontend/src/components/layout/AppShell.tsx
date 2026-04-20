import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const location = useLocation();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] gap-4 p-4 pb-24 md:p-6 md:pb-6">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileNav />
      <main className="glass-panel min-h-[calc(100vh-3rem)] flex-1 overflow-hidden rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
