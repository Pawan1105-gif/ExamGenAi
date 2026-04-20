import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileUp, Loader2, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Generator() {
  const { token } = useAuth();
  const [title, setTitle] = useState("Weekly quiz");
  const [subject, setSubject] = useState("Computer Science");
  const [topic, setTopic] = useState("From my notes");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [questionCount, setQuestionCount] = useState(5);
  const [pastedNotes, setPastedNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExamSet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: File[]) => {
    const allowed = list.filter((f) =>
      /\.(pdf|txt|ppt|pptx)$/i.test(f.name)
    );
    const rejected = list.length - allowed.length;
    if (rejected > 0) {
      toast.message(`${rejected} file(s) skipped — only PDF, TXT, PPT, PPTX.`);
    }
    setFiles((prev) => {
      const next = [...prev, ...allowed];
      return next.slice(0, 8);
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const list = Array.from(e.dataTransfer.files);
      addFiles(list);
    },
    [addFiles]
  );

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("subject", subject);
      fd.set("topic", topic);
      fd.set("difficulty", difficulty);
      fd.set("questionCount", String(questionCount));
      if (pastedNotes.trim()) {
        fd.set("pastedNotes", pastedNotes.trim());
      }
      for (const f of files) {
        fd.append("files", f);
      }

      const res = await apiFetch<{ success: boolean; data: ExamSet }>(
        "/api/exam-sets/generate",
        {
          method: "POST",
          token,
          body: fd,
        }
      );
      setResult(res.data);
      toast.success("Exam generated and saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI exam generator</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Upload PDF, TXT, or PowerPoint notes, paste text, or leave both empty to
          generate from the topic fields only.
        </p>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your materials</CardTitle>
            <CardDescription>
              The model will prioritize content from uploads and pasted notes.
            </CardDescription>
          </CardHeader>
          <div
            role="button"
            tabIndex={0}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              "rounded-2xl border-2 border-dashed border-[var(--color-card-border)] bg-[var(--color-card)]/40 p-6 text-center transition-colors",
              dragActive && "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
            )}
          >
            <FileUp className="mx-auto h-8 w-8 text-[var(--color-muted)]" />
            <p className="mt-2 text-sm font-medium">Drop files here</p>
            <p className="text-xs text-[var(--color-muted)]">
              PDF, TXT, PPT, PPTX · up to 8 files · 15MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.ppt,.pptx,application/pdf,text/plain,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                addFiles(list);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </Button>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f) => (
                <li
                  key={`${f.name}-${f.size}-${f.lastModified}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)]/50 px-3 py-2 text-sm"
                >
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]"
                    aria-label={`Remove ${f.name}`}
                    onClick={() =>
                      setFiles((prev) => prev.filter((x) => x !== f))
                    }
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4">
            <Label htmlFor="pasted">Or paste notes</Label>
            <textarea
              id="pasted"
              value={pastedNotes}
              onChange={(e) => setPastedNotes(e.target.value)}
              placeholder="Paste lecture notes, bullet lists, or any text you want the exam to follow…"
              rows={6}
              className="mt-1.5 w-full resize-y rounded-2xl border border-[var(--color-card-border)] bg-[var(--color-card)] p-4 text-sm backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
          </div>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>Tune title, subject, difficulty, and length.</CardDescription>
          </CardHeader>
          <form onSubmit={onGenerate} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="topic">Topic / focus label</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as typeof difficulty)
                  }
                  className="flex h-11 w-full rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 text-sm backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <Label htmlFor="count">Questions</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={30}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Preview</h2>
        {!result && !busy && (
          <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-[var(--color-card-border)] text-sm text-[var(--color-muted)]">
            Your generated exam will appear here.
          </div>
        )}
        {busy && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-4 rounded-lg bg-[var(--color-card-border)]/50"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
        {result && (
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-surface max-h-[70vh] overflow-auto rounded-2xl p-6 text-sm leading-relaxed"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content}</ReactMarkdown>
          </motion.article>
        )}
      </div>
    </div>
  );
}
