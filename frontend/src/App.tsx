import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Admin } from "@/pages/Admin";
import { Dashboard } from "@/pages/Dashboard";
import { ExamDetail } from "@/pages/ExamDetail";
import { ExamsList } from "@/pages/ExamsList";
import { Generator } from "@/pages/Generator";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { Profile } from "@/pages/Profile";
import { Register } from "@/pages/Register";
import { QuizManagement } from "@/pages/QuizManagement";
import { CreateQuiz } from "@/pages/CreateQuiz";
import { JoinQuiz } from "@/pages/JoinQuiz";
import { QuizAttempt } from "@/pages/QuizAttempt";
import { QuizResults } from "@/pages/QuizResults";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-center" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="generator" element={<Generator />} />
              <Route path="exams" element={<ExamsList />} />
              <Route path="exams/:id" element={<ExamDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route
                path="quiz"
                element={
                  <ProtectedRoute adminOnly>
                    <QuizManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quiz/create"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route path="quiz/join" element={<JoinQuiz />} />
              <Route path="quiz/attempt/:id" element={<QuizAttempt />} />
              <Route
                path="quiz/:id/results"
                element={
                  <ProtectedRoute adminOnly>
                    <QuizResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
