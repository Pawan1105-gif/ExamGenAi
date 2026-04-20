import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ExamSet } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  index: number;
  stem: string;
  options: { [key: string]: string };
  correctAnswer: string;
}

export function CreateQuiz() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [timeLimit, setTimeLimit] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await apiFetch<{ success: boolean; data: { items: ExamSet[] } }>(
          "/api/exam-sets",
          { token }
        );
        setExamSets(res.data.items);
      } catch (e) {
        toast.error("Failed to load exam sets");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSelectExam = (exam: ExamSet) => {
    setSelectedExam(exam);
    setSelectedQuestions(new Set());
    
    // Parse questions from exam content
    const lines = exam.content.split(/\r?\n/);
    const parsedQuestions: Question[] = [];
    let currentQuestion: Partial<Question> | null = null;
    let currentOptions: { [key: string]: string } = {};
    let questionIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^###\s+Q\d+\./i.test(trimmed)) {
        if (currentQuestion && currentQuestion.correctAnswer) {
          currentQuestion.options = currentOptions;
          parsedQuestions.push(currentQuestion as Question);
        }
        currentQuestion = {
          index: questionIndex,
          stem: trimmed.replace(/^###\s+/, ""),
        };
        currentOptions = {};
        questionIndex++;
        continue;
      }

      if (!currentQuestion) continue;

      const optionMatch = trimmed.match(/^([A-D])\)\s+(.+)/);
      if (optionMatch) {
        currentOptions[optionMatch[1]] = optionMatch[2];
        continue;
      }

      if (/^\*\*Answer:\s*([A-D])\*\*/i.test(trimmed)) {
        const match = trimmed.match(/^\*\*Answer:\s*([A-D])\*\*/i);
        if (match) {
          currentQuestion.correctAnswer = match[1];
        }
      }
    }

    if (currentQuestion && currentQuestion.correctAnswer) {
      currentQuestion.options = currentOptions;
      parsedQuestions.push(currentQuestion as Question);
    }

    setQuestions(parsedQuestions);
  };

  const toggleQuestion = (index: number) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedQuestions(newSet);
  };

  async function handleCreateQuiz() {
    if (!selectedExam || selectedQuestions.size === 0) {
      toast.error("Please select an exam and at least one question");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch<{ success: boolean; data: any }>(
        "/api/quizzes",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            title,
            description,
            examSetId: selectedExam.id,
            selectedQuestions: Array.from(selectedQuestions).sort((a, b) => a - b),
            marksPerQuestion: parseInt(String(marksPerQuestion)),
            timeLimit: timeLimit ? parseInt(timeLimit) : undefined,
          }),
        }
      );

      toast.success(`Quiz created! Code: ${res.data.uniqueCode}`);
      navigate("/app/quiz");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create quiz");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/quiz")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Exam Selection and Quiz Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <div className="space-y-4 p-6">
              <div>
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card)] p-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marks">Marks Per Question *</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={marksPerQuestion}
                    onChange={(e) => setMarksPerQuestion(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time Limit (min)</Label>
                  <Input
                    id="time"
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Exam Set</CardTitle>
            </CardHeader>
            <div className="space-y-2 p-6">
              {examSets.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => handleSelectExam(exam)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedExam?.id === exam.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-card-border)] hover:bg-[var(--color-card)]"
                  }`}
                >
                  <div className="font-medium">{exam.title}</div>
                  <div className="text-xs text-[var(--color-muted)]">
                    {exam.subject} • {exam.questionCount} questions
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleCreateQuiz}
            disabled={!selectedExam || selectedQuestions.size === 0 || saving}
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Creating..." : "Create Quiz"}
          </Button>
        </div>

        {/* Right: Question Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Select Questions ({selectedQuestions.size}/{questions.length})
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 p-6 max-h-[600px] overflow-y-auto">
              {questions.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Select an exam set to see questions
                </p>
              ) : (
                questions.map((q) => (
                  <label
                    key={q.index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--color-card)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(q.index)}
                      onChange={() => toggleQuestion(q.index)}
                      className="mt-1"
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{q.stem}</div>
                      <div className="text-xs text-[var(--color-muted)] mt-1 space-y-1">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-mono">{key})</span> {value}
                            {key === q.correctAnswer && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </Card>

          {selectedQuestions.size > 0 && (
            <Card className="bg-blue-50">
              <div className="p-4">
                <div className="text-sm">
                  <div className="font-medium">Quiz Summary</div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div>Selected Questions: {selectedQuestions.size}</div>
                    <div>
                      Total Marks: {selectedQuestions.size * marksPerQuestion}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
