import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CountUp, Reveal, ScrollUI, ThemeToggle, useInView, useTheme } from "./hooks";
import JavaLesson from "./pages/JavaLesson";
import Login from "./pages/Login";
import { logout, getCurrentUser } from "./api/authApi";
import { getAnalytics } from "./api/analyticsApi";
import { getProgressSummary, getUserProgress } from "./api/progressApi";
import { getMastery, getConcepts, updateMastery } from "./api/masteryApi";
import { getPoints, createReward } from "./api/gamificationApi";
import QuizCenter from "./pages/QuizCenter";
import { getCourses } from "./api/courseApi";
import { askTutor } from "./api/tutorApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import mindtraceLogo from "./assets/mindtrace-logo.png";

const courses = [
  {
    id: 1,
    title: "Java Programming",
    short: "J",
    progress: 42,
    description:
      "Learn Java fundamentals, objects, classes, references, collections and exception handling.",
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    short: "D",
    progress: 18,
    description:
      "Understand arrays, stacks, queues, trees, sorting and algorithmic problem solving.",
  },
  {
    id: 3,
    title: "SQL Fundamentals",
    short: "S",
    progress: 0,
    description:
      "Learn queries, filtering, joins, grouping, subqueries and database fundamentals.",
  },
];

const concepts = [
  {
    name: "== vs .equals()",
    status: "Developing",
    level: "medium",
  },
  {
    name: "Object References",
    status: "Needs practice",
    level: "weak",
  },
  {
    name: "String Pool",
    status: "Developing",
    level: "medium",
  },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", short: "Home", icon: "🏠" },
  { id: "courses", label: "Courses", short: "Courses", icon: "📚" },
  { id: "quizzes", label: "Quiz Center", short: "Quiz", icon: "📝" },
  { id: "game", label: "Game Zone", short: "Games", icon: "🎮" },
  { id: "coach", label: "AI Coach", short: "Coach", icon: "🤖" },
  { id: "galaxy", label: "Concept Galaxy", short: "Galaxy", icon: "🌌" },
  { id: "progress", label: "Progress", short: "Progress", icon: "📈" },
];
const MOBILE_PRIMARY = ["dashboard", "courses", "quizzes", "coach"];

function App() {
  const [page, setPage] = useState("dashboard");
  const [theme, toggleTheme] = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(sessionStorage.getItem("accessToken")));

  useEffect(() => {
    const handleUnauthorized = () => setIsAuthenticated(false);
    window.addEventListener("mindtrace:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("mindtrace:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const navigate = (target) => {
    setPage(target);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
    setMoreOpen(false);
    setIsAuthenticated(false);
    setPage("dashboard");
  };

  if (!isAuthenticated) {
    return (
      <Login
        theme={theme}
        onToggleTheme={toggleTheme}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setPage("dashboard");
        }}
      />
    );
  }

  const moreActive = !MOBILE_PRIMARY.includes(page);

  return (
    <div className="app-shell min-h-screen text-slate-900">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar page={page} navigate={navigate} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />

      {/* Mobile top bar */}
      <header className="mobile-topbar md:hidden">
        <button onClick={() => navigate("dashboard")} className="flex items-center gap-2.5" aria-label="MindTrace home">
          <img src="/mindtrace-logo.png" alt="MindTrace AI" className="h-9 w-9 object-contain"/> 
          <span className="brand-word text-lg font-bold tracking-tight">MindTrace</span>
        </button>
        <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
      </header>

      <ScrollUI bar={page !== "java-lesson"} />

      <main id="main-content" key={page} className="page-in min-h-screen pb-28 md:ml-20 md:pb-0 lg:ml-64">
        {page === "dashboard" && <Dashboard navigate={navigate} />}
        {page === "courses" && <Courses navigate={navigate} />}
        {page === "quizzes" && <QuizCenter />}
        {page === "java-lesson" && <JavaLesson />}
        {page === "coach" && <AICoach />}
        {page === "game" && <GameZone />}
        {page === "galaxy" && <ConceptGalaxy navigate={navigate} />}
        {page === "progress" && <Progress />}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav md:hidden" aria-label="Primary">
        {MOBILE_PRIMARY.map((id) => {
          const item = NAV_ITEMS.find((n) => n.id === id);
          const active = page === id;
          return (
            <button key={id} onClick={() => navigate(id)} aria-current={active ? "page" : undefined} className={`bottom-nav__item ${active ? "is-active" : ""}`}>
              <span className="bottom-nav__icon">{item.icon}</span>
              <span>{item.short}</span>
            </button>
          );
        })}
        <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-haspopup="dialog" className={`bottom-nav__item ${moreActive || moreOpen ? "is-active" : ""}`}>
          <span className="bottom-nav__icon">⋯</span>
          <span>More</span>
        </button>
      </nav>

      {/* "More" sheet */}
      {moreOpen && (
        <div className="sheet-backdrop md:hidden" onClick={() => setMoreOpen(false)} role="presentation">
          <div className="sheet" role="dialog" aria-modal="true" aria-label="More options" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <div className="grid grid-cols-3 gap-3">
              {NAV_ITEMS.filter((n) => !MOBILE_PRIMARY.includes(n.id)).map((item) => (
                <button key={item.id} onClick={() => navigate(item.id)} className={`sheet__tile ${page === item.id ? "is-active" : ""}`}>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} className="w-full justify-center" />
              <button onClick={handleLogout} className="sheet__signout">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SIDEBAR  (full on desktop, icon rail on tablet)
===================================================== */

function Sidebar({ page, navigate, onLogout, theme, onToggleTheme }) {
  return (
    <aside className="sidebar fixed left-0 top-0 z-20 hidden h-screen flex-col md:flex md:w-20 lg:w-64">
      <div className="sidebar__brand px-4 py-7 lg:px-7 lg:py-8">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
         <img src={mindtraceLogo} alt="MindTrace AI" className="h-10 w-10 shrink-0 object-contain"/>
          <h1 className="brand-word hidden text-2xl font-bold tracking-tight lg:block">
            MindTrace
          </h1>
        </div>
        <p className="mt-1 hidden text-sm text-slate-500 lg:block">Learn smarter with AI</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 lg:px-4" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={`nav-item ${active ? "is-active" : ""}`}
            >
              {active && <span className="nav-item__bar" />}
              <span className="nav-item__icon">{item.icon}</span>
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar__foot p-3 lg:p-5">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className="mb-3 w-full justify-center" compact={false} />
        <button
          onClick={onLogout}
          title="Sign out"
          className="signout-btn mb-4 w-full rounded-xl border px-3 py-2.5 text-sm font-semibold transition lg:px-4"
        >
          <span className="lg:hidden" aria-hidden="true">⎋</span>
          <span className="hidden lg:inline">Sign out</span>
          <span className="sr-only lg:hidden">Sign out</span>
        </button>
        <div className="sidebar__promo hidden rounded-xl p-4 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">MindTrace AI</p>
          <p className="mt-2 text-sm leading-5 text-slate-600">
            Understand your mistakes. Build stronger concepts.
          </p>
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard({ navigate }) {
  const user = getCurrentUser();
  const [analytics, setAnalytics] = useState(null);
  const [points, setPoints] = useState(null);
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!user?.userId) { setNotice("Your login response did not include a user ID, so live learning metrics cannot be loaded."); return; }
    let active = true;
    Promise.allSettled([getAnalytics(user.userId), getPoints(user.userId), getProgressSummary(user.userId)]).then((results) => {
      if (!active) return;
      if (results[0].status === "fulfilled") setAnalytics(results[0].value);
      if (results[1].status === "fulfilled") setPoints(results[1].value);
      if (results[2].status === "fulfilled") setSummary(results[2].value);
      if (results.every((r) => r.status === "rejected")) setNotice("Live dashboard data could not be loaded. Check backend connectivity and account permissions.");
    });
    return () => { active = false; };
  }, [user?.userId]);
  const displayName = user?.username ? `, ${user.username}` : "";
  return <div className="p-5 sm:p-8 lg:p-10">
    <div className="mb-8 page-head"><p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">Your learning space</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome back{displayName} <span className="wave inline-block">👋</span></h2><p className="mt-3 text-lg text-slate-500">Continue learning and understand your mistakes.</p></div>
    {notice && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}
    <Reveal className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-300/40 sm:p-8"><div className="drift absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl"/><div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Your learning snapshot</p><h3 className="mt-2 text-2xl font-bold sm:text-3xl">{summary?.lessonsCompleted ?? analytics?.lessonsCompleted ?? 0} lessons completed</h3><p className="mt-2 max-w-md text-indigo-100">{summary?.completionPercentage != null ? `${Math.round(summary.completionPercentage)}% lesson completion so far.` : "Choose a course or practice with your AI coach to keep progressing."}</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => navigate("courses")} className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5">Explore courses</button><button onClick={() => navigate("quizzes")} className="rounded-xl border border-white/40 px-5 py-3 font-semibold text-white hover:bg-white/10">Take a quiz</button></div></div><GoalRing value={Math.max(0, Math.min(100, Number(summary?.completionPercentage ?? analytics?.lessonCompletionPercentage ?? 0)))} /></div></Reveal>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 stagger"><StatCard title="Lessons Started" value={analytics?.lessonsStarted ?? summary?.lessonsStarted ?? "—"} subtitle="From your account"/><StatCard title="Lessons Completed" value={analytics?.lessonsCompleted ?? summary?.lessonsCompleted ?? "—"} subtitle="Saved learning progress"/><StatCard title="Concepts Tracked" value={analytics?.conceptsTracked ?? "—"} subtitle="Concepts in your learning profile"/><StatCard title="Average Mastery" value={analytics?.averageMasteryScore != null ? `${Math.round(analytics.averageMasteryScore)}%` : "—"} subtitle="Across tracked concepts"/><StatCard title="Total Points" value={points?.totalPoints ?? analytics?.totalPoints ?? "—"} subtitle={`${points?.rewardsEarned ?? 0} rewards earned`}/><StatCard title="Completion" value={`${Math.round(summary?.completionPercentage ?? analytics?.lessonCompletionPercentage ?? 0)}%`} subtitle="Lesson completion rate"/></div>
  </div>;
}

/* =====================================================
   COURSES
===================================================== */

function Courses({ navigate }) {
  const [courseItems, setCourseItems] = useState(courses);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesNotice, setCoursesNotice] = useState("");

  useEffect(() => {
    let active = true;
    getCourses()
      .then((data) => {
        if (!active) return;
        const rows = Array.isArray(data) ? data : data?.content ?? data?.courses ?? data?.data ?? [];
        if (Array.isArray(rows) && rows.length) {
          const normalized = rows.map((item, index) => ({
            id: item.id ?? item.courseId ?? index + 1,
            title: item.title ?? item.name ?? item.courseName ?? "Untitled course",
            short: String(item.shortName ?? item.code ?? item.title ?? item.name ?? "C").charAt(0).toUpperCase(),
            progress: Number(item.progress ?? item.progressPercentage ?? 0),
            description: item.description ?? "Explore lessons and practice key concepts.",
          }));
          setCourseItems(normalized);
          setCoursesNotice("");
        } else {
          setCoursesNotice("Showing the designed course cards because the API returned no course list.");
        }
      })
      .catch(() => {
        if (active) setCoursesNotice("Live course data is unavailable right now; showing the existing course cards.");
      })
      .finally(() => { if (active) setCoursesLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 page-head">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Learning paths
        </p>

        <h2 className="mt-2 text-4xl font-bold">
          Explore Courses
        </h2>

        <p className="mt-3 text-lg text-slate-500">
          Build your programming skills through focused,
          practical learning.
        </p>
      </div>

      {coursesLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading courses…</p>
      )}
      {coursesNotice && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{coursesNotice}</p>
      )}

      <div className="grid grid-cols-1 gap-6 stagger md:grid-cols-2 xl:grid-cols-3">
        {courseItems.map((course) => (
          <Reveal key={course.id} className="h-full">
            <CourseCard course={course} navigate={navigate} />
          </Reveal>
        ))}
      </div>

      <Reveal as="section" className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Recommended for you
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          Continue Java Fundamentals
        </h3>

        <p className="mt-3 max-w-2xl text-slate-600">
          MindTrace recommends continuing with object references
          and string comparison based on your recent quiz attempts.
        </p>

        <button
          onClick={() => navigate("java-lesson")}
          className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Continue Learning
        </button>
      </Reveal>
    </div>
  );
}

function CourseCard({ course, navigate }) {
  const accentClasses = ["from-orange-400 to-rose-500", "from-indigo-500 to-violet-500", "from-emerald-400 to-teal-500", "from-sky-500 to-cyan-500", "from-amber-400 to-orange-500", "from-fuchsia-500 to-pink-500"];
  const accentClass = accentClasses[Math.abs(Number(course.id) || 0) % accentClasses.length];
  const handleCourseClick = () => {
    if (course.id === 1) {
      navigate("java-lesson");
    } else {
      navigate("coach");
    }
  };

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-200 to-fuchsia-200 opacity-40 blur-2xl transition duration-500 group-hover:scale-150 group-hover:opacity-70" />
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-bold text-white shadow-lg ${accentClass}`}>
        {course.short}
      </div>

      <h3 className="mt-7 text-xl font-bold">
        {course.title}
      </h3>

      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
        {course.description}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-500">
            Progress
          </span>

          <span className="font-semibold">
            {course.progress}%
          </span>
        </div>

        <ProgressBar value={course.progress} />
      </div>

      <button
        onClick={handleCourseClick}
        className={`mt-6 w-full rounded-xl px-5 py-3 font-semibold transition ${
          course.progress > 0
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {course.progress > 0
          ? "Continue Course"
          : "Start Learning"}
      </button>
    </div>
  );
}

/* =====================================================
   AI COACH
===================================================== */

function detectCodeLanguage(code) {
  const source = String(code || "").trim();
  if (!source) return "text";
  if (/^\s*(SELECT|INSERT INTO|UPDATE\s+\w+\s+SET|CREATE TABLE|WITH\s+\w+)\b/i.test(source)) return "sql";
  if (/\b(public|private|protected)\s+(static\s+)?(void|int|String|boolean|class)\b|System\.out\.print|import java\./.test(source)) return "java";
  if (/\b(def|elif|None|True|False|self)\b|print\s*\(|^\s*from\s+\w+\s+import/m.test(source)) return "python";
  if (/\b(const|let|function|console\.log|=>)\b|document\.querySelector/.test(source)) return "javascript";
  if (/\b(interface|type)\s+\w+|:\s*(string|number|boolean)\b/.test(source)) return "typescript";
  if (/<[A-Za-z][^>]*>|<!DOCTYPE html>/i.test(source)) return "markup";
  if (/^[.#]?[\w-]+\s*\{[^}]*:[^}]*\}/s.test(source)) return "css";
  if (/^\s*[\[{]/.test(source)) {
    try { JSON.parse(source); return "json"; } catch (_) { /* not JSON */ }
  }
  return "text";
}

function AICoach() {
  const [answer, setAnswer] = useState("");
  const [questionInput, setQuestionInput] = useState(
    "Explain Java inheritance with a simple example."
  );
  const [submitted, setSubmitted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tutorResponse, setTutorResponse] = useState("");
  const [tutorError, setTutorError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [mode, setMode] = useState("ask");

  const codeQuestion = `String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);`;

  const handleSubmit = async () => {
    if (!questionInput.trim()) {
      setTutorError("Please enter a question first.");
      return;
    }

    if (mode === "analyze" && !answer.trim()) {
      setTutorError("Please write your answer first.");
      return;
    }

    setSubmitted(false);
    setTutorError("");
    setTutorResponse("");
    setAnalyzing(true);

    try {
      const payload = mode === "ask"
        ? {
            question: questionInput.trim(),
            topic: "Java Programming",
            learnerLevel: "beginner"
          }
        : {
            question: [
              "Review my answer to the following Java question. Answer the question directly, then explain my reasoning.",
              "Question: " + questionInput.trim(),
              "Code to consider:\n" + codeQuestion,
              "My answer:\n" + answer.trim(),
              "Identify what is correct or incorrect and explain why in beginner-friendly language."
            ].join("\n\n"),
            topic: "Java Programming",
            learnerLevel: "beginner"
          };

      const result = await askTutor(payload);
      const message =
        result?.answer ??
        result?.response ??
        result?.content ??
        result?.message ??
        result?.reply ??
        (typeof result === "string"
          ? result
          : JSON.stringify(result, null, 2));

      setTutorResponse(String(message));
      setSubmitted(true);
    } catch (error) {
      setTutorError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "AI Tutor request failed. Check the backend endpoint and API key."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 page-head">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          MindTrace AI
        </p>
        <h2 className="mt-2 text-4xl font-bold">AI Coach</h2>
        <p className="mt-3 text-lg text-slate-500">
          Ask questions, understand concepts, and learn from your mistakes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 stagger">
        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold">AI Tutor</h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              Java
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("ask");
                setTutorError("");
                setSubmitted(false);
              }}
              className={`rounded-xl px-4 py-2 font-semibold ${mode === "ask" ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Ask a Question
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("analyze");
                setQuestionInput("What will the Java reference equality code print, and why?");
                setTutorError("");
                setSubmitted(false);
              }}
              className={`rounded-xl px-4 py-2 font-semibold ${mode === "analyze" ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Analyze My Answer
            </button>
          </div>

          {mode === "analyze" && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-medium text-slate-600">
                Java code for this exercise
              </p>
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
                {codeQuestion}
              </pre>
            </div>
          )}

          <label htmlFor="tutor-question" className="mt-5 block text-sm font-semibold text-slate-700">
            {mode === "ask" ? "Your question" : "Question to analyze"}
          </label>
          <textarea
            id="tutor-question"
            value={questionInput}
            onChange={(event) => setQuestionInput(event.target.value)}
            placeholder="Example: Explain Java inheritance with a simple example."
            className="mt-2 min-h-[110px] w-full resize-y rounded-xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {mode === "analyze" && (
            <>
              <label htmlFor="tutor-answer" className="mt-5 block text-sm font-semibold text-slate-700">
                Your answer
              </label>
              <textarea
                id="tutor-answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer and explain your reasoning..."
                className="mt-2 min-h-[120px] w-full resize-y rounded-xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </>
          )}

          <button
            type="button"
            disabled={analyzing}
            onClick={handleSubmit}
            className="mt-4 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {analyzing ? "Thinking..." : mode === "ask" ? "Ask AI Tutor" : "Analyze My Answer"}
          </button>

          {analyzing && (
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
              Preparing your explanation...
            </div>
          )}

          {tutorError && (
            <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {tutorError}
            </div>
          )}

          {submitted && (
            <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
              <p className="font-semibold text-indigo-900">AI Tutor response</p>
              <div className="mt-3 break-words text-sm leading-7 text-indigo-950">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="mb-3 mt-5 text-2xl font-bold">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-5 text-xl font-bold">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-4 text-lg font-semibold">
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p className="mb-4">{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="mb-4 list-disc space-y-2 pl-6">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-4 list-decimal space-y-2 pl-6">
          {children}
        </ol>
      ),
      pre: ({ children }) => {
        const codeNode = Array.isArray(children) ? children[0] : children;
        const codeText = String(codeNode?.props?.children ?? "").replace(/\n$/, "");
        const languageClass = codeNode?.props?.className ?? "";
        const declaredLanguage = languageClass.replace("language-", "").split(" ")[0];
        const language = declaredLanguage || detectCodeLanguage(codeText);

        const handleExplainCode = async () => {
          setTutorError("");
          setAnalyzing(true);
          try {
            const result = await askTutor({
              question: `Explain this ${language} code step by step in beginner-friendly language. Describe what it does, important lines, and any potential issues.\n\n\`\`\`${language}\n${codeText}\n\`\`\``,
              topic: "Code Explanation",
              learnerLevel: "beginner",
            });
            const message = result?.answer ?? result?.response ?? result?.content ?? result?.message ?? result?.reply ?? (typeof result === "string" ? result : JSON.stringify(result, null, 2));
            setTutorResponse(String(message));
            setSubmitted(true);
          } catch (error) {
            setTutorError(error.response?.data?.message || error.response?.data?.error || "Could not explain this code. Please check the AI Tutor backend.");
          } finally {
            setAnalyzing(false);
          }
        };

        const handleCopyCode = async () => {
          try {
            await navigator.clipboard.writeText(codeText);
            setCopiedCode(true);
            window.setTimeout(() => setCopiedCode(false), 1800);
          } catch (error) {
            console.error("Could not copy code:", error);
            setTutorError("Could not copy code. Please select the code and copy it manually.");
          }
        };

        return (
          <div className="relative my-4 overflow-hidden rounded-xl border border-slate-700">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {language} code
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExplainCode}
                  disabled={analyzing}
                  className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Explain this code with AI"
                >
                  {analyzing ? "Explaining..." : "Explain Code"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label="Copy code to clipboard"
                >
                  {copiedCode ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              showLineNumbers
              wrapLongLines
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "#0b1120",
                fontSize: "0.875rem",
                lineHeight: "1.6",
              }}
              lineNumberStyle={{ color: "#64748b", minWidth: "2.25em" }}
            >
              {codeText}
            </SyntaxHighlighter>
          </div>
        );
      },

      code: ({ children, className }) => {
        const isBlock = Boolean(className);

        if (!isBlock) {
          return (
            <code className="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-800">
              {children}
            </code>
          );
        }

        return <code className={className}>{children}</code>;
      },
      strong: ({ children }) => (
        <strong className="font-bold">{children}</strong>
      ),
    }}
  >
    {tutorResponse}
  </ReactMarkdown>
</div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-bold">Learning tips</h3>
          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
            <p>Ask one specific question at a time.</p>
            <p>Request a simple example when learning a new concept.</p>
            <p>Use Analyze My Answer to get feedback on your reasoning.</p>
          </div>
          <div className="mt-7 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold">Suggested next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Once inheritance is clear, ask about method overriding and the use of the super keyword.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function LearningSignal({ title, value, type }) {
  const styles = {
    weak: "bg-rose-50 text-rose-600",
    medium: "bg-amber-50 text-amber-600",
    strong: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <span
        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${styles[type]}`}
      >
        {value}
      </span>
    </div>
  );
}

/* =====================================================
   GAME ZONE
===================================================== */

const blockColors = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
];

function GameZone() {
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState("stack");
  const [xp, setXp] = useState(0);
  const [toast, setToast] = useState(null);
  const [gameNotice, setGameNotice] = useState("");
  const user = getCurrentUser();
  const level = Math.floor(xp / 100) + 1;
  useEffect(() => { if (user?.userId) getPoints(user.userId).then((d) => setXp(Number(d?.totalPoints ?? 0))).catch(() => setGameNotice("Points could not be loaded from backend.")); }, [user?.userId]);
  const award = async (n, text) => {
    if (!user?.userId) { setGameNotice("Log in to save XP rewards."); return; }
    try {
      await createReward(user.userId, { code: `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`, title: text, points: n });
      const latest = await getPoints(user.userId);
      setXp(Number(latest?.totalPoints ?? (xp + n)));
      setToast({ n, text, id: Date.now() }); setGameNotice("");
    } catch (error) { setGameNotice(error.response?.data?.message || "Reward could not be saved. Please try again later."); }
  };
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t); }, [toast]);

  const games = [
    { id: "stack", category: "learn", icon: "🗼", title: "Stack Tower", tag: "LIFO", text: "Push, pop & complete missions", color: "from-indigo-500 to-violet-500" },
    { id: "queue", category: "learn", icon: "🎟️", title: "Queue Line", tag: "FIFO", text: "Serve customers in order", color: "from-emerald-500 to-teal-500" },
    { id: "match", category: "learn", icon: "🧠", title: "Concept Match", tag: "Memory", text: "Match programming concepts", color: "from-amber-500 to-rose-500" },
    { id: "slingshot", category: "arcade", icon: "🎯", title: "Slingshot Smash", tag: "Arcade", text: "Aim, launch and knock targets down", color: "from-orange-500 to-rose-500" },
    { id: "bubble", category: "arcade", icon: "🫧", title: "Bubble Pop", tag: "Relax", text: "Pop bubbles before time runs out", color: "from-cyan-500 to-blue-500" },
    { id: "reflex", category: "arcade", icon: "⚡", title: "Quick Reflex", tag: "Speed", text: "Test your reaction time", color: "from-fuchsia-500 to-purple-500" },
    { id: "quiz", category: "quiz", icon: "❓", title: "Quick Quiz", tag: "Trivia", text: "Fast questions, instant feedback", color: "from-blue-500 to-indigo-600" },
    { id: "codebattle", category: "quiz", icon: "💻", title: "Code Battle", tag: "Tech", text: "Java, Python, SQL and React", color: "from-slate-700 to-slate-900" },
    { id: "brain", category: "quiz", icon: "🧩", title: "Brain Sprint", tag: "Logic", text: "Quick maths and logic challenges", color: "from-lime-500 to-emerald-600" },
  ];
  const visibleGames = games.filter(g => category === "all" || g.category === category || (category === "learn" && g.category === "learn"));
  const categories = [{ id: "all", label: "All Games" }, { id: "arcade", label: "Arcade · Mind Fresh" }, { id: "quiz", label: "Quiz · Brain Challenge" }, { id: "learn", label: "Learning Games" }];
  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 page-head">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Play · Learn · Recharge</p>
        <h2 className="mt-2 text-4xl font-bold">Game Zone</h2>
        <p className="mt-3 text-lg text-slate-500">Take a break with arcade games or sharpen your skills with quick quizzes.</p>
      </div>
      {gameNotice && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{gameNotice}</p>}
      <Reveal className="mb-7 flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-lg"><span className="text-[10px] font-semibold uppercase tracking-wider">Lvl</span><span className="text-2xl font-bold leading-none">{level}</span></div>
        <div className="flex-1"><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold">Level {level} Explorer</span><span className="text-slate-500">{xp % 100} / 100 XP</span></div><ProgressBar value={xp % 100} /><p className="mt-2 text-xs text-slate-500">Play games and complete challenges to earn XP.</p></div>
      </Reveal>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(c => <button key={c.id} onClick={() => setCategory(c.id)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${category === c.id ? "border-indigo-600 bg-indigo-600 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"}`}>{c.label}</button>)}
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleGames.map(g => <Reveal key={g.id}><button onClick={() => setTab(g.id)} className={`group relative h-full min-h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-left text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${g.color} ${tab === g.id ? "ring-4 ring-indigo-200 shadow-xl" : ""}`}><span className="absolute -right-4 -top-6 h-28 w-28 rounded-full bg-white/10 transition group-hover:scale-125"/><span className="absolute right-4 top-4 rounded-full bg-black/10 px-3 py-1 text-xs font-semibold backdrop-blur">{g.tag}</span><span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-inner">{g.icon}</span><h3 className="relative mt-4 text-xl font-bold">{g.title}</h3><p className="relative mt-1 text-sm text-white/85">{g.text}</p><span className="relative mt-4 inline-block text-xs font-bold uppercase tracking-wider text-white/90">{tab === g.id ? "Now playing" : "Play game →"}</span></button></Reveal>)}
      </div>
      <div key={tab} className="pop-in">
        {tab === "stack" && <StackGame award={award} />}
        {tab === "queue" && <QueueGame award={award} />}
        {tab === "match" && <MatchGame award={award} />}
        {tab === "slingshot" && <SlingshotGame award={award} />}
        {tab === "bubble" && <BubblePopGame award={award} />}
        {tab === "reflex" && <ReflexGame award={award} />}
        {tab === "quiz" && <MiniQuiz award={award} mode="general" />}
        {tab === "codebattle" && <MiniQuiz award={award} mode="code" />}
        {tab === "brain" && <BrainSprint award={award} />}
      </div>
      {toast && <div key={toast.id} className="pop-in fixed bottom-24 left-1/2 z-40 w-max max-w-[92vw] -translate-x-1/2 rounded-xl bg-slate-900 md:bottom-8 px-5 py-3 text-sm font-semibold text-white shadow-2xl"><span className="text-amber-300">+{toast.n} XP</span> · {toast.text}</div>}
    </div>
  );
}

function MiniGamePanel({ title, subtitle, children }) {
  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white"><h3 className="text-2xl font-bold">{title}</h3><p className="mt-1 text-sm text-white/70">{subtitle}</p></div><div className="p-6">{children}</div></section>;
}

function SlingshotGame({ award }) {
  const [power, setPower] = useState(55); const [hits, setHits] = useState(0); const [message, setMessage] = useState("Set your power, then launch the stone at the targets.");
  const launch = () => { const hit = power >= 35 && power <= 78; if (hit) { setHits(h => h + 1); setMessage("Direct hit! The target stack tumbles down."); if (hits === 2) award(20, "Slingshot streak"); } else setMessage(power < 35 ? "Too short! Increase the launch power." : "Overshot the targets! Try a little less power."); };
  return <MiniGamePanel title="🎯 Slingshot Smash" subtitle="A casual aim-and-launch game · Hit the target zone to score"><div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-100 p-5 sm:p-8"><div className="flex min-h-44 items-end justify-between"><div className="text-6xl">🪨</div><div className="mb-3 text-5xl">🏹</div><div className="flex flex-col items-center"><div className="text-4xl">{hits > 0 ? "💥" : "🧱"}</div><div className="mt-1 flex gap-1 text-2xl">{Array.from({length:Math.max(0,5-hits)},(_,i)=><span key={i}>🧱</span>)}</div><span className="mt-2 text-xs font-bold text-slate-600">TARGETS: {Math.max(0,5-hits)}</span></div></div></div><div className="mt-5 flex flex-wrap items-center gap-4"><label className="min-w-48 flex-1 text-sm font-semibold">Launch power: {power}%<input className="mt-3 w-full accent-indigo-600" type="range" min="0" max="100" value={power} onChange={e=>setPower(Number(e.target.value))}/></label><button onClick={launch} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">Launch stone</button><button onClick={()=>{setHits(0);setPower(55);setMessage("New round! Aim carefully.")}} className="rounded-xl border px-5 py-3 font-semibold">Reset</button></div><p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message} · Score: {hits}</p></MiniGamePanel>;
}

function BubblePopGame({ award }) {
  const [popped, setPopped] = useState([]); const [round, setRound] = useState(0); const bubbles = ["#fb7185","#60a5fa","#34d399","#fbbf24","#a78bfa","#22d3ee","#f472b6","#4ade80","#818cf8","#f97316","#38bdf8","#c084fc"];
  const pop = i => { if (popped.includes(i)) return; const next=[...popped,i]; setPopped(next); if(next.length===bubbles.length) { award(15,"Bubble Pop clear"); setRound(r=>r+1); setPopped([]); } };
  return <MiniGamePanel title="🫧 Bubble Pop" subtitle="Tap every bubble to clear the board and relax"><div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{bubbles.map((color,i)=><button key={`${round}-${i}`} onClick={()=>pop(i)} aria-label={`Pop bubble ${i+1}`} className={`aspect-square rounded-full text-3xl shadow-lg transition duration-200 hover:scale-105 ${popped.includes(i)?"scale-75 opacity-15":"animate-pulse"}`} style={{background:`radial-gradient(circle at 30% 25%, white, ${color} 42%, ${color} 75%, #334155)`,animationDuration:`${1.4+(i%4)*.35}s`}}>{popped.includes(i)?"":"✦"}</button>)}</div><div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-semibold">Popped: {popped.length}/{bubbles.length}</span><button onClick={()=>setPopped([])} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Reset bubbles</button></div></MiniGamePanel>;
}

function ReflexGame({ award }) {
  const [state,setState]=useState("ready"); const [start,setStart]=useState(0); const [result,setResult]=useState(null); const timer=useRef(null);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const begin=()=>{clearTimeout(timer.current);setResult(null);setState("wait");timer.current=setTimeout(()=>{setStart(Date.now());setState("go")},900+Math.random()*2200)};
  const click=()=>{if(state==="ready"){begin();return}if(state==="wait"){clearTimeout(timer.current);setState("early");return}if(state==="go"){const ms=Date.now()-start;setResult(ms);setState("done");if(ms<450)award(10,"Quick Reflex round")}};
  return <MiniGamePanel title="⚡ Quick Reflex" subtitle="Wait for green, then click as fast as you can"><button onClick={click} className={`flex min-h-64 w-full flex-col items-center justify-center rounded-3xl p-8 text-white transition ${state==="go"?"bg-emerald-500":"bg-slate-900 hover:bg-slate-800"}`}><span className="text-5xl">{state==="go"?"⚡":state==="wait"?"⏳":"🎮"}</span><span className="mt-4 text-2xl font-black">{state==="go"?"CLICK NOW!":state==="wait"?"Wait for green…":state==="early"?"Too early! Try again.":state==="done"?`${result} ms` : "Start reaction test"}</span><span className="mt-2 text-sm text-white/70">{state==="done"?"Lower is faster.":"Click this panel to play."}</span></button><div className="mt-4 flex justify-end"><button onClick={begin} className="rounded-xl border px-5 py-3 font-semibold">Try again</button></div></MiniGamePanel>;
}

const quizSets = {
  general: [
    {q:"Which data structure follows FIFO?", options:["Stack","Queue","Tree","Graph"],a:1,why:"Queue removes the earliest item first: First In, First Out."},
    {q:"Which HTML element creates a hyperlink?", options:["<div>","<p>","<a>","<h1>"],a:2,why:"The anchor element <a> creates links."},
    {q:"What does CPU stand for?", options:["Central Processing Unit","Computer Personal Utility","Core Program User","Central Power Unit"],a:0,why:"CPU means Central Processing Unit."},
    {q:"Which one is a valid CSS layout system?", options:["Flexbox","JDBC","JVM","HTTP"],a:0,why:"Flexbox is a CSS layout model."},
    {q:"How many bits are in one byte?", options:["4","8","16","32"],a:1,why:"One byte contains eight bits."}
  ],
  code: [
    {q:"Which Java keyword creates an object?",options:["make","new","class","this"],a:1,why:"The new keyword allocates and constructs an object."},
    {q:"Which SQL clause filters rows before grouping?",options:["ORDER BY","HAVING","WHERE","SELECT"],a:2,why:"WHERE filters rows before GROUP BY aggregation."},
    {q:"Which Python type is mutable?",options:["tuple","str","list","int"],a:2,why:"A Python list can be changed after creation."},
    {q:"React component state is commonly managed with which Hook?",options:["useState","useRoute","useClass","useFetchState"],a:0,why:"useState adds local state to function components."},
    {q:"Which HTTP method is typically used to retrieve data?",options:["POST","GET","PATCH","DELETE"],a:1,why:"GET requests retrieve a representation of a resource."}
  ]
};
function MiniQuiz({ award, mode }) {
  const questions=quizSets[mode]; const [index,setIndex]=useState(0); const [answers,setAnswers]=useState({}); const [finished,setFinished]=useState(false); const score=questions.filter((q,i)=>answers[i]===q.a).length; const q=questions[index];
  const choose=i=>{if(answers[index]!==undefined)return;setAnswers(a=>({...a,[index]:i}));};
  const next=()=>{if(index<questions.length-1)setIndex(i=>i+1);else{setFinished(true);const finalScore=questions.filter((item,i)=>(answers[i]??(i===index?answers[index]:undefined))===item.a).length;if(finalScore>=3)award(15,mode==="code"?"Code Battle quiz":"Quick Quiz completed")}};
  const restart=()=>{setIndex(0);setAnswers({});setFinished(false)};
  return <MiniGamePanel title={mode==="code"?"💻 Code Battle":"❓ Quick Quiz"} subtitle="Five questions · Choose an answer and learn from the explanation">{finished?<div className="py-8 text-center"><div className="text-5xl">{score>=4?"🏆":"✨"}</div><h4 className="mt-4 text-3xl font-bold">{score}/{questions.length} correct</h4><p className="mt-2 text-slate-500">{score>=4?"Excellent work!":"Nice try — play again to improve your score."}</p><button onClick={restart} className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Play again</button></div>:<><div className="mb-5 flex items-center justify-between text-sm"><span className="font-bold">Question {index+1} of {questions.length}</span><span className="text-slate-500">Score: {score}</span></div><div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{width:`${(index+1)/questions.length*100}%`}}/></div><h4 className="mb-5 text-xl font-bold">{q.q}</h4><div className="grid gap-3 sm:grid-cols-2">{q.options.map((opt,i)=><button key={opt} onClick={()=>choose(i)} className={`rounded-xl border p-4 text-left font-medium transition ${answers[index]===i?(i===q.a?"border-emerald-400 bg-emerald-50 text-emerald-800":"border-rose-300 bg-rose-50 text-rose-800"):"border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"}`}>{opt}</button>)}</div>{answers[index]!==undefined&&<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{q.why}</p>}<div className="mt-5 flex justify-end"><button disabled={answers[index]===undefined} onClick={next} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{index===questions.length-1?"See result":"Next question →"}</button></div></>}</MiniGamePanel>;
}

function BrainSprint({ award }) {
  const [round,setRound]=useState(0);const [answer,setAnswer]=useState("");const [feedback,setFeedback]=useState("");const problems=[{q:"12 + 9 = ?",a:"21"},{q:"6 × 7 = ?",a:"42"},{q:"50 − 18 = ?",a:"32"},{q:"81 ÷ 9 = ?",a:"9"},{q:"What comes next: 2, 4, 8, 16, …?",a:"32"}];
  const check=()=>{if(answer.trim()===problems[round].a){setFeedback("Correct! Great focus.");if(round===problems.length-1)award(15,"Brain Sprint completed")}else setFeedback("Not quite — try again.")};
  const next=()=>{setRound(r=>(r+1)%problems.length);setAnswer("");setFeedback("")};
  return <MiniGamePanel title="🧩 Brain Sprint" subtitle="Quick-fire maths and pattern puzzles"><div className="rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-100 p-8 text-center"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Challenge {round+1} / {problems.length}</p><h4 className="mt-4 text-3xl font-black text-slate-900">{problems[round].q}</h4><input value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="Your answer" className="mt-6 w-full max-w-xs rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center text-lg outline-none focus:ring-2 focus:ring-emerald-400"/><div className="mt-4 flex flex-wrap justify-center gap-3"><button onClick={check} className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white">Check answer</button><button onClick={next} className="rounded-xl border border-emerald-300 bg-white px-6 py-3 font-bold text-emerald-800">Next puzzle</button></div>{feedback&&<p className="mt-4 font-semibold text-emerald-800">{feedback}</p>}</div></MiniGamePanel>;
}

function GameShell({ title, subtitle, badge, children, side }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">{badge}</span>
        </div>
        {children}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">{side}</div>
    </div>
  );
}

function StackGame({ award }) {
  const [stack, setStack] = useState(["A", "B"]);
  const [leaving, setLeaving] = useState(false);
  const [msg, setMsg] = useState("Stack follows LIFO — Last In, First Out.");
  const [stats, setStats] = useState({ pushes: 0, pops: 0 });
  const [done, setDone] = useState([]);

  const missions = [
    { id: "p3", text: "Push 3 blocks", ok: stats.pushes >= 3, xp: 20 },
    { id: "o2", text: "Pop 2 blocks", ok: stats.pops >= 2, xp: 20 },
    { id: "full", text: "Fill the tower (6 blocks)", ok: stack.length >= 6, xp: 30 },
  ];

  useEffect(() => {
    missions.forEach((m) => {
      if (m.ok && !done.includes(m.id)) {
        setDone((d) => [...d, m.id]);
        award(m.xp, `Mission: ${m.text}`);
      }
    });
  });

  const push = () => {
    if (leaving) return;
    if (stack.length >= 6) return setMsg("Tower is full. Try popping a block first.");
    const next = String.fromCharCode(65 + stack.length);
    setStack([...stack, next]);
    setStats((s) => ({ ...s, pushes: s.pushes + 1 }));
    setMsg(`You pushed ${next}. It sits on top of the stack.`);
  };

  const pop = () => {
    if (leaving) return;
    if (!stack.length) return setMsg("The stack is empty.");
    const removed = stack[stack.length - 1];
    setLeaving(true);
    setMsg(`You popped ${removed}. The last block added left first.`);
    setTimeout(() => {
      setStack((c) => c.slice(0, -1));
      setStats((s) => ({ ...s, pops: s.pops + 1 }));
      setLeaving(false);
    }, 300);
  };

  return (
    <GameShell
      title="Stack Tower"
      subtitle="Build and remove blocks using stack operations."
      badge="LIFO"
      side={
        <>
          <h3 className="text-lg font-bold">Missions</h3>
          <div className="mt-5 space-y-3">
            {missions.map((m) => (
              <div key={m.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${done.includes(m.id) ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done.includes(m.id) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {done.includes(m.id) ? "✓" : "•"}
                </span>
                <span className="flex-1 text-sm font-medium">{m.text}</span>
                <span className="text-xs font-semibold text-amber-600">+{m.xp}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <Rule title="Push" text="Adds a block to the top." />
            <Rule title="Pop" text="Removes the top block." />
          </div>
        </>
      }
    >
      <div className="mt-8 flex min-h-[360px] items-end justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50 p-8">
        <div className="flex w-64 flex-col-reverse gap-2 border-b-4 border-slate-300 pb-2">
          {stack.map((item, i) => (
            <div
              key={item}
              className={`relative flex h-12 items-center justify-center rounded-xl bg-gradient-to-r font-bold text-white shadow-md ${blockColors[i % 6]} ${leaving && i === stack.length - 1 ? "block-out" : "block-in"}`}
            >
              Block {item}
              {i === stack.length - 1 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-600 shadow">TOP</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={push} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white">Push</button>
        <button onClick={pop} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Pop</button>
      </div>

      <div key={msg} className="pop-in mt-5 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">{msg}</div>
    </GameShell>
  );
}

function QueueGame({ award }) {
  const [q, setQ] = useState([1, 2, 3]);
  const [next, setNext] = useState(4);
  const [leaving, setLeaving] = useState(false);
  const [served, setServed] = useState(0);

  const enqueue = () => {
    if (leaving || q.length >= 6) return;
    setQ([...q, next]);
    setNext(next + 1);
  };

  const dequeue = () => {
    if (leaving || !q.length) return;
    const who = q[0];
    setLeaving(true);
    setTimeout(() => {
      setQ((c) => c.slice(1));
      setLeaving(false);
      setServed((n) => n + 1);
      award(5, `Served ticket #${who}`);
    }, 300);
  };

  return (
    <GameShell
      title="Queue Line"
      subtitle="New people join at the back. The front of the line is served first."
      badge="FIFO"
      side={
        <>
          <h3 className="text-lg font-bold">What you're learning</h3>
          <div className="mt-5 space-y-4">
            <Rule title="Enqueue" text="Adds an item to the back." />
            <Rule title="Dequeue" text="Removes the item at the front." />
            <Rule title="FIFO" text="First In, First Out." />
          </div>
          <div className="mt-7 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600"><CountUp value={String(served)} /></p>
            <p className="text-sm text-slate-500">customers served</p>
          </div>
        </>
      }
    >
      <div className="mt-8 flex min-h-[200px] flex-col justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50 p-6">
        <div className="mb-3 flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>← Front (served first)</span>
          <span>Back (joins here) →</span>
        </div>
        <div className="flex min-h-[88px] items-center gap-3">
          {q.length === 0 && <p className="w-full text-center text-sm text-slate-400">Nobody in line. Enqueue someone!</p>}
          {q.map((id, i) => (
            <div
              key={id}
              className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white shadow-md ${leaving && i === 0 ? "block-out" : "block-in"}`}
            >
              <span className="text-xl">🎟️</span>
              <span className="text-sm">#{id}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={enqueue} disabled={q.length >= 6} className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50">Enqueue</button>
        <button onClick={dequeue} className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Dequeue</button>
      </div>
      <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
        Ticket #{q[0] ?? "–"} is at the front, so it will be served next.
      </div>
    </GameShell>
  );
}

const PAIRS = [
  ["==", "Compares references"],
  ["equals()", "Compares values"],
  ["new", "Creates an object"],
  ["Stack", "LIFO structure"],
];

const makeDeck = () =>
  PAIRS.flatMap(([a, b], p) => [
    { key: `${p}a`, pair: p, text: a },
    { key: `${p}b`, pair: p, text: b },
  ]).sort(() => Math.random() - 0.5);

function MatchGame({ award }) {
  const [cards, setCards] = useState(makeDeck);
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const pick = (i) => {
    if (lock || open.includes(i) || matched.includes(cards[i].pair)) return;
    const o = [...open, i];
    setOpen(o);
    if (o.length < 2) return;
    setMoves((m) => m + 1);
    setLock(true);
    const [a, b] = o.map((k) => cards[k]);
    setTimeout(() => {
      if (a.pair === b.pair) {
        const nm = [...matched, a.pair];
        setMatched(nm);
        nm.length === PAIRS.length
          ? award(50, "Memory master! All pairs matched")
          : award(10, "Pair matched!");
      }
      setOpen([]);
      setLock(false);
    }, 800);
  };

  const restart = () => {
    setCards(makeDeck());
    setOpen([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <GameShell
      title="Concept Match"
      subtitle="Flip two cards to match each Java term with its meaning."
      badge="Memory"
      side={
        <>
          <h3 className="text-lg font-bold">Your run</h3>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-2xl font-bold text-amber-600">{moves}</p>
              <p className="text-xs text-slate-500">moves</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-2xl font-bold text-emerald-600">{matched.length}/{PAIRS.length}</p>
              <p className="text-xs text-slate-500">pairs</p>
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            Tip: remember where each card is. Fewer moves means a better run.
          </p>
          <button onClick={restart} className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
            Shuffle & restart
          </button>
        </>
      }
    >
      <div className="mt-8 grid grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const isMatched = matched.includes(c.pair);
          const on = open.includes(i) || isMatched;
          return (
            <button key={c.key} onClick={() => pick(i)} className="flip-card h-28">
              <div className={`flip-inner relative h-full w-full ${on ? "on" : ""}`}>
                <div className="flip-face absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-3xl text-white shadow-md">?</div>
                <div className={`flip-face flip-back absolute inset-0 flex items-center justify-center rounded-xl border-2 p-2 text-center text-sm font-semibold ${isMatched ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-indigo-300 bg-white text-indigo-700"}`}>
                  {c.text}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}

function Rule({ title, text }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>

      <p className="mt-1 text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* =====================================================
   CONCEPT GALAXY
===================================================== */

const galaxyNodes = [
  { name: "Java Basics", x: 18, y: 35, status: "mastered", mastery: 92, note: "Solid. Syntax and program structure are second nature." },
  { name: "Variables", x: 35, y: 22, status: "mastered", mastery: 86, note: "Strong grasp of primitive and reference variable declarations." },
  { name: "Objects", x: 49, y: 42, status: "developing", mastery: 58, note: "You know what objects are, but sometimes blur them with variables." },
  { name: "References", x: 65, y: 25, status: "weak", mastery: 41, note: "You often treat a reference as if it were the object itself." },
  { name: "Strings", x: 73, y: 52, status: "developing", mastery: 64, note: "The string pool and new String() still trip you up." },
  { name: "== vs equals()", x: 47, y: 72, status: "developing", mastery: 64, note: "You recently confused reference equality with value equality." },
  { name: "Memory", x: 28, y: 68, status: "developing", mastery: 55, note: "Stack vs heap is understood, but not yet applied to references." },
];

const galaxyEdges = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [2, 6], [3, 4], [4, 5], [6, 5], [2, 5]];

const statusLabel = { mastered: "Mastered", developing: "Developing", weak: "Needs practice" };
const statusBadge = {
  mastered: "bg-emerald-50 text-emerald-700",
  developing: "bg-amber-50 text-amber-700",
  weak: "bg-rose-50 text-rose-700",
};

function ConceptGalaxy({ navigate }) {
  const [selected, setSelected] = useState(0);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [nodes, setNodes] = useState(galaxyNodes);
  const [galaxyNotice, setGalaxyNotice] = useState("");
  const user = getCurrentUser();
  useEffect(() => {
    let active = true;
    Promise.allSettled([getConcepts(), user?.userId ? getMastery(user.userId) : Promise.resolve([])]).then(([conceptResult, masteryResult]) => {
      if (!active) return;
      if (conceptResult.status !== "fulfilled" || !Array.isArray(conceptResult.value) || !conceptResult.value.length) {
        setGalaxyNotice("Showing the concept map design because no concept list was returned by the backend."); return;
      }
      const masteries = masteryResult.status === "fulfilled" && Array.isArray(masteryResult.value) ? masteryResult.value : [];
      const mapped = conceptResult.value.map((concept, i) => {
        const scoreRow = masteries.find((m) => Number(m.conceptId) === Number(concept.id));
        const mastery = Math.max(0, Math.min(100, Number(scoreRow?.masteryScore ?? 0)));
        const base = galaxyNodes[i % galaxyNodes.length];
        const status = mastery >= 80 ? "mastered" : mastery >= 40 ? "developing" : "weak";
        return { ...base, id: concept.id, name: concept.name ?? `Concept ${i + 1}`, mastery, status, note: scoreRow?.notes ?? `Current recorded mastery is ${mastery}%. Practice this concept and update your mastery to improve the score.` };
      });
      setNodes(mapped); setSelected(0); setGalaxyNotice("");
    });
    return () => { active = false; };
  }, [user?.userId]);
  const node = nodes[Math.min(selected, nodes.length - 1)] ?? galaxyNodes[0];
  const visibleEdges = galaxyEdges.filter(([a, b]) => a < nodes.length && b < nodes.length);

  const stars = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        x: (i * 37 + 11) % 100,
        y: (i * 61 + 7) % 100,
        size: i % 6 === 0 ? 3 : 2,
        d: ((i % 7) * 0.45).toFixed(2),
        t: (2.5 + (i % 5) * 0.7).toFixed(1),
      })),
    []
  );

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="mb-8 page-head">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          MindTrace AI
        </p>
        <h2 className="mt-2 text-4xl font-bold">Concept Galaxy</h2>
        <p className="mt-3 text-lg text-slate-500">
          Explore your knowledge and discover where you need more practice.
          Click any star.
        </p>
      </div>

      {galaxyNotice && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{galaxyNotice}</p>}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="relative col-span-1 h-[500px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950 lg:col-span-2 lg:h-[620px]">
          {stars.map((st, i) => (
            <span
              key={i}
              className="star absolute rounded-full bg-white"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                width: st.size,
                height: st.size,
                "--d": `${st.d}s`,
                "--t": `${st.t}s`,
              }}
            />
          ))}

          <svg className="absolute inset-0 h-full w-full">
            {visibleEdges.map(([a, b], i) => {
              const A = nodes[a];
              const B = nodes[b];
              const hot = a === selected || b === selected;
              return (
                <line
                  key={i}
                  x1={`${A.x}%`}
                  y1={`${A.y}%`}
                  x2={`${B.x}%`}
                  y2={`${B.y}%`}
                  pathLength="1"
                  className="edge"
                  style={{ animationDelay: `${i * 90}ms`, transition: "stroke 0.3s" }}
                  stroke={hot ? "#818cf8" : "#334155"}
                  strokeWidth={hot ? 2 : 1}
                />
              );
            })}
          </svg>

          {nodes.map((n, i) => (
            <GalaxyNode
              key={n.name}
              node={n}
              index={i}
              active={i === selected}
              onSelect={() => setSelected(i)}
            />
          ))}
        </div>

        <div
          key={selected}
          className="pop-in rounded-2xl border border-slate-200 bg-white p-5 lg:p-7"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Selected concept
          </p>

          <h3 className="mt-3 text-2xl font-bold">{node.name}</h3>

          <span
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[node.status]}`}
          >
            {statusLabel[node.status]}
          </span>

          <div className="mt-7">
            <p className="text-sm font-semibold">Mastery</p>
            <div className="mt-3">
              <ProgressBar value={node.mastery} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              <CountUp value={`${node.mastery}%`} /> mastery
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold">What MindTrace noticed</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{node.note}</p>
          </div>

          <button
            type="button"
            onClick={() => setPracticeOpen(true)}
            disabled={!node?.id || !user?.userId}
            className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >Practice this concept
          </button>
          {!user?.userId && <p className="mt-2 text-xs text-rose-600">User ID missing. Please sign in again to save practice results.</p>}
          {practiceOpen && node && <ConceptPractice
            concept={node}
            userId={user?.userId}
            onClose={() => setPracticeOpen(false)}
            onSaved={(updated) => {
              setNodes((current) => current.map((item) => item.id === updated.conceptId ? { ...item, mastery: updated.masteryScore, status: updated.masteryScore >= 80 ? "mastered" : updated.masteryScore >= 40 ? "developing" : "weak", note: updated.notes || `Practice score saved: ${updated.masteryScore}%.` } : item));
            }}
          />}
        </div>
      </div>
    </div>
  );
}

const practiceQuestionsFor = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("loop")) return [
    { q: "Which loop is commonly used when the number of iterations is known?", options: ["for", "switch", "try-catch", "class"], correct: 0, explain: "A for loop is commonly used when the iteration count or range is known." },
    { q: "What does `break` do inside a loop?", options: ["Skips to next iteration", "Exits the loop", "Restarts the program", "Declares a variable"], correct: 1, explain: "break immediately exits the nearest loop." },
    { q: "In a while loop, when is the condition checked?", options: ["Before each iteration", "Only after the loop", "At compile time only", "Never"], correct: 0, explain: "A while loop checks its condition before each iteration." },
  ];
  if (n.includes("array")) return [
    { q: "In Java, what is the index of the first array element?", options: ["1", "-1", "0", "Depends on size"], correct: 2, explain: "Java arrays are zero-indexed." },
    { q: "How do you get an array's length in Java?", options: ["array.size()", "array.length", "array.length()", "len(array)"], correct: 1, explain: "Java arrays expose a length field." },
    { q: "What happens when you access an invalid array index?", options: ["Returns null always", "Array grows", "ArrayIndexOutOfBoundsException", "Returns 0 always"], correct: 2, explain: "An invalid index causes ArrayIndexOutOfBoundsException at runtime." },
  ];
  if (n.includes("variable") || n.includes("data type")) return [
    { q: "Which type stores true or false in Java?", options: ["int", "boolean", "String", "char[]"], correct: 1, explain: "boolean stores either true or false." },
    { q: "Which declaration is a valid Java int variable?", options: ["int count = 3;", "number count = 3;", "count int = 3;", "int = count 3;"], correct: 0, explain: "A Java declaration uses type, identifier, and optionally an initial value." },
    { q: "Which type is used for text objects in Java?", options: ["String", "boolean", "double", "byte"], correct: 0, explain: "String represents text in Java." },
  ];
  if (n.includes("string") || n.includes("equals") || n.includes("reference")) return [
    { q: "What does `==` compare for two Java object references?", options: ["Always text content", "Reference identity", "Object size", "Class name only"], correct: 1, explain: "For objects, == compares whether both references point to the same object." },
    { q: "Which method usually compares String contents?", options: ["compareRef()", "same()", "equals()", "matchRef()"], correct: 2, explain: "String.equals() compares character content." },
    { q: "What does `new String(\"hi\")` create?", options: ["A new String object", "An int", "A loop", "A boolean"], correct: 0, explain: "The new keyword creates a new object." },
  ];
  return [
    { q: `Which option best describes ${name}?`, options: ["A programming concept", "A database password", "A browser tab", "A CSS color only"], correct: 0, explain: `${name} is tracked as a learning concept in MindTrace. Review its lesson for the full definition.` },
    { q: "Why should you practice a concept?", options: ["To check understanding and identify gaps", "To delete the course", "To skip all lessons", "To change the username"], correct: 0, explain: "Practice helps measure understanding and identify areas to revisit." },
    { q: "What should you do after an incorrect answer?", options: ["Review the explanation", "Ignore the result", "Assume mastery is 100%", "Close the app"], correct: 0, explain: "Reviewing explanations helps correct misunderstandings." },
  ];
};

function ConceptPractice({ concept, userId, onClose, onSaved }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const questions = useMemo(() => practiceQuestionsFor(concept.name), [concept.name]);

  // Keep the dialog outside animated/transformed page containers to prevent opening flicker.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  const submit = async () => {
    if (questions.some((_, i) => answers[i] === undefined)) { setError("Please answer all 3 questions first."); return; }
    const correct = questions.reduce((sum, q, i) => sum + (Number(answers[i]) === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setSubmitting(true); setError("");
    try {
      const saved = await updateMastery(userId, concept.id, { masteryScore: score, notes: `Concept practice: ${correct}/${questions.length} correct (${score}%).` });
      setResult({ correct, score, saved });
      onSaved({ conceptId: concept.id, masteryScore: Number(saved?.masteryScore ?? score), notes: saved?.notes ?? `Concept practice: ${correct}/${questions.length} correct (${score}%).` });
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Practice score could not be saved. Check backend access and concept ID.");
      setResult({ correct, score, saved: false });
    } finally { setSubmitting(false); }
  };
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-3 sm:p-5" role="presentation">
      <section className="flex max-h-[min(90dvh,850px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={`${concept.name} practice`}>
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-7">
          <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Concept practice</p><h3 className="mt-1 text-2xl font-bold">{concept.name}</h3><p className="mt-1 text-sm text-slate-500">Answer all {questions.length} questions. Your score will be saved to your mastery record.</p></div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50" aria-label="Close practice">✕</button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
          {!result && <div className="space-y-5">{questions.map((q, i) => <fieldset key={q.q} className="rounded-xl border border-slate-200 p-4"><legend className="px-1 font-semibold">{i + 1}. {q.q}</legend><div className="mt-2 space-y-2">{q.options.map((option, j) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${Number(answers[i]) === j ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name={`practice-${concept.id}-${i}`} checked={answers[i] !== undefined && Number(answers[i]) === j} onChange={() => setAnswers((a) => ({ ...a, [i]: j }))} />{option}</label>)}</div></fieldset>)}</div>}
          {result && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5"><p className="text-2xl font-bold text-indigo-900">Score: {result.score}%</p><p className="mt-1 text-sm text-indigo-800">{result.correct} out of {questions.length} correct.</p>{questions.map((q, i) => <p key={q.q} className="mt-3 text-sm text-slate-700"><strong>{i + 1}. {Number(answers[i]) === q.correct ? "Correct" : `Correct answer: ${q.options[q.correct]}`}.</strong> {q.explain}</p>)}<p className="mt-4 text-sm font-semibold">{result.saved ? "Mastery score saved successfully." : "Score calculated, but not saved."}</p></div>}
          {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </div>
        <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-100 bg-white p-4 sm:p-5">{result && <button type="button" onClick={() => { setAnswers({}); setResult(null); setError(""); }} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">Try again</button>}<button type="button" onClick={result ? onClose : submit} disabled={submitting} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{submitting ? "Saving score…" : result ? "Done" : "Submit practice"}</button></footer>
      </section>
    </div>,
    document.body
  );
}

function GalaxyNode({ node, index, active, onSelect }) {
  const dot = {
    mastered: "border-emerald-300 bg-emerald-500",
    developing: "border-amber-300 bg-amber-500",
    weak: "border-rose-300 bg-rose-500",
  };
  const ring = {
    mastered: "bg-emerald-400",
    developing: "bg-amber-400",
    weak: "bg-rose-400",
  };

  return (
    <button
      onClick={onSelect}
      className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        animation: `pop-in 0.6s ${index * 90}ms backwards`,
      }}
    >
      <span className="drift relative block" style={{ animationDelay: `${index * 0.4}s` }}>
        {(active || node.status === "weak") && (
          <span className={`ring-ping absolute inset-0 rounded-full ${ring[node.status]}`} />
        )}
        <span
          className={`relative block h-5 w-5 rounded-full border-4 shadow-lg transition duration-300 group-hover:scale-125 ${dot[node.status]} ${
            active ? "scale-150 ring-4 ring-white/30" : ""
          }`}
        />
      </span>

      <span
        className={`mt-2 whitespace-nowrap text-xs font-medium transition ${
          active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
        }`}
      >
        {node.name}
      </span>
    </button>
  );
}

/* =====================================================
   PROGRESS
===================================================== */

function Progress() {
  const user = getCurrentUser();
  const [summary, setSummary] = useState(null); const [analytics, setAnalytics] = useState(null);
  const [progressRows, setProgressRows] = useState([]); const [masteryRows, setMasteryRows] = useState([]); const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!user?.userId) { setNotice("User ID is missing from the login response; progress data cannot be loaded."); return; }
    let active = true;
    Promise.allSettled([getProgressSummary(user.userId), getAnalytics(user.userId), getUserProgress(user.userId), getMastery(user.userId)]).then((rs) => {
      if (!active) return;
      if (rs[0].status === "fulfilled") setSummary(rs[0].value);
      if (rs[1].status === "fulfilled") setAnalytics(rs[1].value);
      if (rs[2].status === "fulfilled") setProgressRows(Array.isArray(rs[2].value) ? rs[2].value : []);
      if (rs[3].status === "fulfilled") setMasteryRows(Array.isArray(rs[3].value) ? rs[3].value : []);
      if (rs.every((r) => r.status === "rejected")) setNotice("Progress APIs are not available. Check backend status and user access.");
    });
    return () => { active = false; };
  }, [user?.userId]);
  return <div className="p-5 sm:p-8 lg:p-10"><div className="mb-8 page-head"><p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Your growth</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Progress</h2><p className="mt-3 text-lg text-slate-500">Your learning progress and concept mastery, loaded from MindTrace backend.</p></div>
    {notice && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 stagger"><StatCard title="Lessons Started" value={summary?.lessonsStarted ?? analytics?.lessonsStarted ?? "—"} subtitle="From saved progress"/><StatCard title="Lessons Completed" value={summary?.lessonsCompleted ?? analytics?.lessonsCompleted ?? "—"} subtitle="Completed lessons"/><StatCard title="Completion Rate" value={`${Math.round(summary?.completionPercentage ?? analytics?.lessonCompletionPercentage ?? 0)}%`} subtitle="Overall learning completion"/><StatCard title="Concepts Tracked" value={analytics?.conceptsTracked ?? masteryRows.length} subtitle="Tracked in your profile"/><StatCard title="Average Mastery" value={analytics?.averageMasteryScore != null ? `${Math.round(analytics.averageMasteryScore)}%` : (masteryRows.length ? `${Math.round(masteryRows.reduce((n, x) => n + Number(x.masteryScore ?? 0), 0) / masteryRows.length)}%` : "—")} subtitle="Across tracked concepts"/><StatCard title="Learning Records" value={progressRows.length} subtitle="Saved lesson progress entries"/></div>
    <Reveal as="section" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-xl font-bold">Concept mastery</h3>{masteryRows.length ? <div className="mt-7 space-y-6">{masteryRows.map((item, i) => <MasteryRow key={item.id ?? item.conceptId ?? i} name={item.conceptName ?? `Concept ${item.conceptId ?? i + 1}`} value={Number(item.masteryScore ?? 0)}/>)}</div> : <p className="mt-4 text-sm text-slate-500">No mastery records are available yet. Practice and update concept mastery to populate this section.</p>}</Reveal>
    <Reveal as="section" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-xl font-bold">Learning history</h3>{progressRows.length ? <div className="mt-5 divide-y divide-slate-100">{progressRows.map((item, i) => <div key={item.id ?? `${item.lessonId}-${i}`} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{item.lessonTitle ?? `Lesson ${item.lessonId ?? i + 1}`}</p><p className="text-xs text-slate-500">{item.completed ? "Completed" : "In progress"}</p></div><div className="w-full sm:max-w-xs"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Progress</span><span>{item.progressPercentage ?? 0}%</span></div><ProgressBar value={Number(item.progressPercentage ?? 0)}/></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No lesson progress saved yet.</p>}</Reveal>
  </div>;
}

function MasteryRow({ name, value }) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">{name}</span>

        <span className="text-sm font-semibold">
          {value}%
        </span>
      </div>

      <ProgressBar value={value} />
    </div>
  );
}

function HistoryRow({ title, score, date }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium">{title}</p>

        <p className="mt-1 text-sm text-slate-500">
          {date}
        </p>
      </div>

      <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
        {score}
      </span>
    </div>
  );
}

/* =====================================================
   SHARED COMPONENTS
===================================================== */

function GoalRing({ value }) {
  const [ref, inView] = useInView();
  const c = 2 * Math.PI * 52;

  return (
    <div ref={ref} className="relative hidden h-36 w-36 shrink-0 sm:block">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c * (1 - value / 100) : c}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.2, 0.7, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold"><CountUp value={`${value}%`} /></span>
        <span className="text-xs text-indigo-100">daily goal</span>
      </div>
    </div>
  );
}

const statIcons = {
  "Current Streak": "🔥",
  "Concepts Mastered": "🏆",
  "Quiz Accuracy": "🎯",
  "Average Accuracy": "🎯",
  "Questions Attempted": "📝",
};

function StatCard({ title, value, subtitle }) {
  return (
    <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-lg">
          {statIcons[title] ?? "✨"}
        </span>
      </div>

      <p className="mt-2 bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-3xl font-bold text-transparent">
        <CountUp value={value} />
      </p>

      <p className="mt-2 text-sm text-emerald-600">{subtitle}</p>
    </Reveal>
  );
}

function ProgressBar({ value }) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-1000 ease-out"
        style={{ width: inView ? `${value}%` : "0%" }}
      />
    </div>
  );
}

function ConceptCard({ name, status, level }) {
  const styles = {
    weak: ["border-rose-200 bg-rose-50", "bg-rose-500", "⚠️"],
    medium: ["border-amber-200 bg-amber-50", "bg-amber-500", "🌱"],
    strong: ["border-emerald-200 bg-emerald-50", "bg-emerald-500", "✅"],
  };
  const [box, bar, icon] = styles[level];

  return (
    <Reveal className={`group relative overflow-hidden rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${box}`}>
      <span className={`absolute inset-y-0 left-0 w-1.5 ${bar}`} />
      <div className="flex items-start justify-between">
        <h4 className="text-lg font-bold">{name}</h4>
        <span className="text-xl transition group-hover:scale-125">{icon}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{status}</p>
    </Reveal>
  );
}

export default App;
