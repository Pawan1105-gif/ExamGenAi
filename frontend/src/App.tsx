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
