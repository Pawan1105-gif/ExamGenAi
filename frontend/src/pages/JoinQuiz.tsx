import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizDetails {
  id: string;
  title: string;
  description?: string;
  marksPerQuestion: number;
  timeLimit?: number;
  totalQuestions: number;
  totalMarks: number;
  questions: any[];
}

export function JoinQuiz() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [quizCode, setQuizCode] = useState("");
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearchQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizCode.trim()) {
      toast.error("Please enter a quiz code");
      return;
    }

    setSearching(true);
    try {
      const res = await apiFetch<{ success: boolean; data: QuizDetails }>(
        `/api/quizzes/code/${quizCode.toUpperCase().trim()}`,
        { token }
      );
      setQuizDetails(res.data);
      toast.success("Quiz found!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Quiz not found");
      setQuizDetails(null);
    } finally {
      setSearching(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quizDetails) return;
    navigate(`/app/quiz/attempt/${quizDetails.id}`, {
      state: { quiz: quizDetails },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Join a Quiz</CardTitle>
          </CardHeader>
          <div className="space-y-6 p-6">
            <form onSubmit={handleSearchQuiz} className="space-y-4">
              <div>
                <Label htmlFor="code">Quiz Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                    placeholder="Enter the quiz code (e.g., ABC12345)"
                    maxLength={8}
                  />
                  <Button
                    type="submit"
                    disabled={searching}
                    className="px-6"
                  >
                    {searching ? "Searching..." : "Search"}
                  </Button>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  Get the quiz code from your instructor
                </p>
              </div>
            </form>

            {quizDetails && (
              <div className="border-t border-[var(--color-card-border)] pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{quizDetails.title}</h3>
                  {quizDetails.description && (
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                      {quizDetails.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-3 rounded-lg bg-[var(--color-card)]">
                    <div className="text-xs text-[var(--color-muted)]">Questions</div>
                    <div className="text-xl font-bold">{quizDetails.totalQuestions}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-card)]">
                    <div className="text-xs text-[var(--color-muted)]">
                      Per Question
                    </div>
                    <div className="text-xl font-bold">
                      {quizDetails.marksPerQuestion}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-card)]">
                    <div className="text-xs text-[var(--color-muted)]">Total Marks</div>
                    <div className="text-xl font-bold">{quizDetails.totalMarks}</div>
                  </div>
                  {quizDetails.timeLimit && (
                    <div className="p-3 rounded-lg bg-[var(--color-card)]">
                      <div className="text-xs text-[var(--color-muted)]">Time Limit</div>
                      <div className="text-xl font-bold">
                        {quizDetails.timeLimit} min
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartQuiz}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Quiz
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
