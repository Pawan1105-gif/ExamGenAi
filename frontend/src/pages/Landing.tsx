import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Layers,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";

const features = [
  {
    icon: Brain,
    title: "AI-crafted assessments",
    description:
      "Describe your topic and difficulty — get structured MCQs with explanations.",
  },
  {
    icon: Layers,
    title: "Organized library",
    description: "Search, filter, and paginate every exam you have generated.",
  },
  {
    icon: BarChart3,
    title: "Insightful dashboard",
    description: "Personal stats for learners; org-wide metrics for admins.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description: "JWT authentication, role-based access, validated APIs.",
  },
];

export function Landing() {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="neo-surface flex h-10 w-10 items-center justify-center rounded-xl">
            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <span className="font-semibold tracking-tight">ExamGen AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={toggle}>
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-10 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <motion.p
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-card-border)] bg-[var(--color-card)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            Production-ready exam studio
          </motion.p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.1]">
            Generate{" "}
            <motion.span
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              beautiful exams
            </motion.span>{" "}
            in seconds.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--color-muted)]">
            A full-stack experience with glassmorphism UI, smooth motion, and an
            API designed for scale — built for educators and teams who care about
            quality.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register">
              <Button size="lg" className="group">
                Start free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                I have an account
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="mt-20 grid gap-6 md:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card delay={i * 0.05} className="h-full neo-surface border-0">
                <CardHeader>
                  <f.icon className="mb-2 h-8 w-8 text-[var(--color-primary)]" />
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
