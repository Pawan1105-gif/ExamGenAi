import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  index: number;
  stem: string;
  options: { [key: string]: string };
}

interface QuizDetails {
  id: string;
  title: string;
  description?: string;
  marksPerQuestion: number;
  timeLimit?: number;
  totalQuestions: number;
  totalMarks: number;
  questions: Question[];
}

export function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const quiz = location.state?.quiz as QuizDetails | null;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!quiz) {
      navigate("/app/quiz/join");
      return;
    }

    setQuestions(quiz.questions);

    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60); // convert to seconds
    }
  }, [quiz, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  if (!quiz) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const selectAnswer = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length === 0) {
      toast.error("Please answer at least one question");
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([idx, ans]) => ({
        questionIndex: parseInt(idx),
        selectedAnswer: ans,
      }));

      const res = await apiFetch<{ success: boolean; data: any }>(
        "/api/quizzes/submit",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            quizId: id,
            answers: formattedAnswers,
            timeTaken: quiz.timeLimit
              ? (quiz.timeLimit * 60 - (timeLeft || 0))
              : undefined,
          }),
        }
      );

      setScore(res.data.score);
      setShowResults(true);
      toast.success("Quiz submitted successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const totalMarks = quiz.totalQuestions * quiz.marksPerQuestion;
  const percentage = parseFloat(((score / totalMarks) * 100).toFixed(2));

  if (showResults) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
          </CardHeader>
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{quiz.title}</h2>
              <p className="text-[var(--color-muted)]">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-[var(--color-card)]">
                <div className="text-sm text-[var(--color-muted)]">Your Score</div>
                <div className="text-3xl font-bold mt-1">{score}</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  / {totalMarks}
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-[var(--color-card)]">
                <div className="text-sm text-[var(--color-muted)]">Percentage</div>
                <div className="text-3xl font-bold mt-1">{percentage}%</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-[var(--color-card)]">
                <div className="text-sm text-[var(--color-muted)]">Questions</div>
                <div className="text-3xl font-bold mt-1">{answeredCount}</div>
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  / {quiz.totalQuestions}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${
              percentage >= 70
                ? "bg-green-50 text-green-700"
                : percentage >= 50
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-red-50 text-red-700"
            }`}>
              <p className="font-medium">
                {percentage >= 70
                  ? "🎉 Excellent! You passed!"
                  : percentage >= 50
                    ? "✓ You passed!"
                    : "Try again"}
              </p>
            </div>

            <Button
              onClick={() => navigate("/app")}
              className="w-full"
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/quiz/join")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" />
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Quiz Title */}
      <Card>
        <div className="p-4 border-b border-[var(--color-card-border)]">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Question {currentQuestion + 1} of {quiz.totalQuestions}
          </p>
        </div>

        {/* Progress */}
        <div className="p-4 border-b border-[var(--color-card-border)]">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestion + 1) / quiz.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6 space-y-6">
          {currentQ && (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-4">{currentQ.stem}</h2>

                {/* Options */}
                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        answers[currentQuestion] === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-[var(--color-card-border)] hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={key}
                        checked={answers[currentQuestion] === key}
                        onChange={() => selectAnswer(currentQuestion, key)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">
                        <strong>{key})</strong> {value}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4 border-t border-[var(--color-card-border)]">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                >
                  Previous
                </Button>

                {currentQuestion < quiz.totalQuestions - 1 ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestion((prev) =>
                        Math.min(quiz.totalQuestions - 1, prev + 1)
                      )
                    }
                    className="flex-1"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || answeredCount === 0}
                    className="flex-1 gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                )}
              </div>

              {/* Question Indicator */}
              <div className="pt-4 border-t border-[var(--color-card-border)]">
                <div className="text-sm text-[var(--color-muted)] mb-2">
                  Answered: {answeredCount}/{quiz.totalQuestions}
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: quiz.totalQuestions }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-8 h-8 text-xs font-medium rounded ${
                        answers[idx]
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
