import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function ExamDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: ExamSet }>(
          `/api/exam-sets/${id}`,
          { token }
        );
        setExam(res.data);
        setEditTitle(res.data.title);
        setEditContent(res.data.content);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Not found");
        navigate("/app/exams");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id, navigate]);

  async function save() {
    if (!token || !id) return;
    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; data: ExamSet }>(
        `/api/exam-sets/${id}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ title: editTitle, content: editContent }),
        }
      );
      setExam(res.data);
      toast.success("Saved changes");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!token || !id) return;
    if (!confirm("Delete this exam permanently?")) return;
    try {
      await apiFetch(`/api/exam-sets/${id}`, { method: "DELETE", token });
      toast.success("Deleted");
      navigate("/app/exams");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/app/exams">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Badge className="capitalize">{exam.difficulty}</Badge>
        <span className="text-sm text-[var(--color-muted)]">
          {exam.subject} · {exam.topic}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="etitle">Title</Label>
            <Input
              id="etitle"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="danger" onClick={remove}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--color-muted)]">
            Edit Markdown
          </h2>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="h-[480px] w-full resize-none rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 font-mono text-sm backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--color-muted)]">
            Rendered
          </h2>
          <article className="neo-surface max-h-[480px] overflow-auto rounded-2xl p-4 text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{editContent}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
