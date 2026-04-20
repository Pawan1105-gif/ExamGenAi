import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet, Paginated } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function ExamsList() {
  const { token } = useAuth();
  const [data, setData] = useState<Paginated<ExamSet> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const limit = 8;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());
      if (subject.trim()) params.set("subject", subject.trim());
      const res = await apiFetch<{ success: boolean; data: Paginated<ExamSet> }>(
        `/api/exam-sets?${params}`,
        { token }
      );
      setData(res.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, subject]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My exams</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Search, filter by subject, paginate — full CRUD on the detail page.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative">
            <Label htmlFor="q" className="sr-only">
              Search
            </Label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              id="q"
              placeholder="Search title or topic…"
              className="pl-9 sm:w-56"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div>
            <Label htmlFor="subj">Subject</Label>
            <Input
              id="subj"
              placeholder="e.g. Physics"
              className="sm:w-44"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <Card className="text-center text-sm text-[var(--color-muted)]">
          No exams yet.{" "}
          <Link to="/app/generator" className="text-[var(--color-primary)] underline">
            Generate one
          </Link>
          .
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.items.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/app/exams/${exam.id}`}>
                <Card className="cursor-pointer transition hover:ring-2 hover:ring-[var(--color-primary)]/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {exam.subject} · {exam.topic}
                      </p>
                    </div>
                    <Badge className="capitalize">{exam.difficulty}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-[var(--color-muted)]">
                    {exam.questionCount} questions ·{" "}
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[var(--color-muted)]">
            Page {data.page} / {data.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
