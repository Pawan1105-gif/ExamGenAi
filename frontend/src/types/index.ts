export type Role = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExamSet = {
  id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
