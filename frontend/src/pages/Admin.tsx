import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet, Paginated } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function Admin() {
  const { token } = useAuth();
  const [data, setData] = useState<Paginated<ExamSet> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiFetch<{ success: boolean; data: Paginated<ExamSet> }>(
        `/api/admin/exam-sets?${params}`,
        { token }
      );
      setData(res.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin · All exam sets</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Cross-tenant visibility for administrators only.
        </p>
      </div>
      <Input
        placeholder="Search…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />
      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-2">
          {data?.items.map((exam) => (
            <Link key={exam.id} to={`/app/exams/${exam.id}`}>
              <Card className="cursor-pointer py-4 transition hover:ring-2 hover:ring-amber-400/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{exam.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {exam.subject} · owner {exam.userId.slice(0, 8)}…
                    </p>
                  </div>
                  <Badge>{exam.difficulty}</Badge>
                </div>
              </Card>
            </Link>
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
