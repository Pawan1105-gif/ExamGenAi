import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  submittedAt: string;
  timeTaken?: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: Attempt[] }>(
          `/api/quizzes/${id}/attempts`,
          { token }
        );
        setAttempts(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load attempts");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]);

  const downloadCSV = () => {
    if (attempts.length === 0) {
      toast.error("No attempts to download");
      return;
    }

    const headers = ["Student Name", "Email", "Score", "Date Submitted", "Time Taken (sec)"];
    const rows = attempts.map((a) => [
      a.user.name,
      a.user.email,
      a.score,
      new Date(a.submittedAt).toLocaleString(),
      a.timeTaken || "N/A",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Results downloaded");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/quiz")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Button>
        {attempts.length > 0 && (
          <Button
            variant="outline"
            onClick={downloadCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">Quiz Results</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          {attempts.length} student{attempts.length !== 1 ? "s have" : " has"} attempted this quiz
        </p>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <p className="text-[var(--color-muted)]">No attempts yet</p>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-card-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-card)] border-b border-[var(--color-card-border)]">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Student</th>
                <th className="px-6 py-3 text-left font-medium">Email</th>
                <th className="px-6 py-3 text-center font-medium">Score</th>
                <th className="px-6 py-3 text-left font-medium">Submitted</th>
                <th className="px-6 py-3 text-center font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="border-b border-[var(--color-card-border)] hover:bg-[var(--color-card)]"
                >
                  <td className="px-6 py-3 font-medium">{attempt.user.name}</td>
                  <td className="px-6 py-3 text-[var(--color-muted)]">
                    {attempt.user.email}
                  </td>
                  <td className="px-6 py-3 text-center font-bold">
                    {attempt.score}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-center text-sm">
                    {attempt.timeTaken
                      ? `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
