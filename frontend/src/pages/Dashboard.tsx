import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, BookOpen, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Stats =
  | {
      role: "ADMIN";
      totals: { users: number; examSets: number; examSetsThisMonth: number };
    }
  | { role: "USER"; totals: { myExamSets: number } };

const demoTrend = [
  { label: "Mon", v: 2 },
  { label: "Tue", v: 5 },
  { label: "Wed", v: 3 },
  { label: "Thu", v: 8 },
  { label: "Fri", v: 6 },
  { label: "Sat", v: 4 },
  { label: "Sun", v: 7 },
];

export function Dashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: Stats }>(
          "/api/dashboard/stats",
          { token }
        );
        setStats(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          className="text-2xl font-semibold tracking-tight md:text-3xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Hello, {user?.name?.split(" ")[0] || "there"}
        </motion.h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Here is what is happening in your workspace.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : stats?.role === "ADMIN" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card delay={0}>
            <CardHeader>
              <Users className="mb-2 h-6 w-6 text-[var(--color-primary)]" />
              <CardTitle>{stats.totals.users}</CardTitle>
              <CardDescription>Registered users</CardDescription>
            </CardHeader>
          </Card>
          <Card delay={0.05}>
            <CardHeader>
              <BookOpen className="mb-2 h-6 w-6 text-[var(--color-accent)]" />
              <CardTitle>{stats.totals.examSets}</CardTitle>
              <CardDescription>Total exam sets</CardDescription>
            </CardHeader>
          </Card>
          <Card delay={0.1}>
            <CardHeader>
              <Sparkles className="mb-2 h-6 w-6 text-amber-400" />
              <CardTitle>{stats.totals.examSetsThisMonth}</CardTitle>
              <CardDescription>Created this month</CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <BookOpen className="mb-2 h-6 w-6 text-[var(--color-primary)]" />
              <CardTitle>{stats?.totals.myExamSets ?? 0}</CardTitle>
              <CardDescription>Your saved exam sets</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Next step</CardTitle>
              <CardDescription>
                Generate a new exam with AI tailored to your syllabus.
              </CardDescription>
              <Link to="/app/generator" className="mt-4 inline-block">
                <Button>
                  Open generator
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card className="neo-surface border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity trend</CardTitle>
            <CardDescription>
              Illustrative sparkline — wire to analytics when you add historical
              metrics.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="h-64 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={demoTrend}>
              <defs>
                <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-card-border)"
              />
              <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={12} />
              <YAxis stroke="var(--color-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-card-border)",
                  borderRadius: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--color-primary)"
                fill="url(#fill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
