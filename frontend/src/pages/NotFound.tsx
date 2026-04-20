import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md rounded-3xl p-10"
      >
        <p className="text-sm font-medium text-[var(--color-muted)]">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          This page drifted away
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          The link may be broken or the resource was removed.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button>
            <Home className="h-4 w-4" />
            Back home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
