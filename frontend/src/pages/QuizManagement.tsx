import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  examSet: ExamSet;
  uniqueCode: string;
  marksPerQuestion: number;
  timeLimit?: number;
  selectedQuestions: number[];
  createdAt: string;
  _count?: {
    attempts: number;
  };
}

export function QuizManagement() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: Quiz[] }>(
          "/api/quizzes/admin/list",
          { token }
        );
        setQuizzes(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Quiz code copied to clipboard!");
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
        <div>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Create and manage quizzes for your exam sets
          </p>
        </div>
        <Button onClick={() => navigate("/app/quiz/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <p className="text-[var(--color-muted)]">No quizzes created yet</p>
            <Button
              onClick={() => navigate("/app/quiz/create")}
              className="mt-4"
              variant="outline"
            >
              Create your first quiz
            </Button>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        {quiz.description && (
                          <p className="text-sm text-[var(--color-muted)] mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge>{quiz.examSet.subject}</Badge>
                          <Badge>
                            {quiz.selectedQuestions.length} Questions
                          </Badge>
                          <Badge>
                            {quiz.marksPerQuestion} marks/q
                          </Badge>
                          {quiz.timeLimit && (
                            <Badge>
                              {quiz.timeLimit} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="bg-[var(--color-card)] rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold font-mono">
                        {quiz.uniqueCode}
                      </div>
                      <button
                        onClick={() => copyCode(quiz.uniqueCode)}
                        className="text-xs text-[var(--color-primary)] hover:underline mt-1 flex items-center justify-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy code
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-card-border)]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/quiz/${quiz.id}/results`)}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Attempts ({quiz._count?.attempts || 0})
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
