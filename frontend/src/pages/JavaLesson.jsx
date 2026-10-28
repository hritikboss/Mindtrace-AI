import { useEffect, useState } from "react";
import { Reveal, useScrollPct } from "../hooks";

function JavaLesson() {
  const [completed, setCompleted] = useState(false);

  const concepts = [
    {
      title: "Variables",
      description:
        "Variables store values that your program can use and change.",
      code: `int age = 20;
String name = "Prachi";`,
    },
    {
      title: "Objects",
      description:
        "Objects are instances of classes. They contain data and behavior.",
      code: `Student student = new Student();`,
    },
    {
      title: "Object References",
      description:
        "A reference variable points to an object stored in memory.",
      code: `Student a = new Student();
Student b = a;`,
    },
    {
      title: "String Comparison",
      description:
        "In Java, == compares references while equals() compares values.",
      code: `String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);       // false
System.out.println(a.equals(b));  // true`,
    },
  ];

  const scroll = useScrollPct();
  const pct = completed ? 100 : Math.round(scroll);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        }),
      { rootMargin: "-35% 0px -55% 0px" }
    );
    concepts.forEach((_, i) => {
      const el = document.getElementById(`concept-${i}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              JAVA FUNDAMENTALS
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Understanding Java Basics
            </h1>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">Lesson progress</p>

            <p className="font-semibold text-slate-900">
              {pct}%
            </p>
          </div>
        </div>
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Lesson Content */}
          <section className="lg:col-span-2">
            {/* Introduction */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Lesson 1
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Variables, Objects & References
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Before solving difficult Java problems, you need to understand
                how Java stores and works with data. This lesson introduces
                variables, objects, references, and string comparison.
              </p>
            </div>

            {/* Concepts */}
            <div className="mt-8 space-y-6">
              {concepts.map((concept, index) => (
                <Reveal as="article"
                  key={concept.title}
                  id={`concept-${index}`}
                  data-i={index}
                  className={`scroll-mt-28 rounded-2xl border bg-white p-7 shadow-sm transition-all duration-300 ${
                    active === index
                      ? "border-indigo-300 ring-4 ring-indigo-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold">
                        {concept.title}
                      </h3>

                      <p className="mt-2 leading-7 text-slate-600">
                        {concept.description}
                      </p>

                      <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-100">
                        <code>{concept.code}</code>
                      </pre>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Key Idea */}
            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Key idea
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Understand the difference between a value and a reference.
              </h3>

              <p className="mt-3 leading-7 text-slate-700">
                Many Java mistakes happen because learners assume that two
                variables containing the same-looking value must refer to the
                same object. MindTrace will help identify and practice these
                kinds of misconceptions.
              </p>
            </div>

            {/* Complete Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setCompleted(true)}
                className="rounded-xl bg-indigo-600 px-7 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                {completed ? "Lesson Completed ✓" : "Mark Lesson Complete"}
              </button>
            </div>
          </section>

          {/* Right Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:h-fit lg:overflow-y-auto">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                In this lesson
              </p>

              <ul className="mt-4 space-y-1">
                {concepts.map((c, i) => (
                  <li key={c.title}>
                    <button
                      onClick={() =>
                        document
                          .getElementById(`concept-${i}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" })
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        active === i
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full transition-all ${
                          active === i ? "scale-150 bg-indigo-600" : "bg-slate-300"
                        }`}
                      />
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Your learning path
              </p>

              <h3 className="mt-2 text-lg font-bold">
                Java Fundamentals
              </h3>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm font-semibold text-indigo-700">
                    01 · Variables & Objects
                  </p>

                  <p className="mt-1 text-xs text-indigo-600">
                    Current lesson
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-700">
                    02 · Classes & Methods
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-700">
                    03 · Collections
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-700">
                    04 · Exceptions
                  </p>
                </div>
              </div>
            </div>

            {/* AI Coach Card */}
            <div className="mt-6 rounded-2xl bg-slate-900 p-6 text-white">
              <p className="text-sm font-semibold text-indigo-300">
                MINDTRACE AI
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Need help understanding something?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Ask the AI Coach about a concept and get a guided explanation
                instead of simply seeing the answer.
              </p>

              <button className="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-100">
                Ask AI Coach
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default JavaLesson;