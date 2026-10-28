

import { useState } from "react";

import { login, signup } from "../api/authApi";
import { ThemeToggle } from "../hooks";
 
export default function Login({ onLoginSuccess, theme = "light", onToggleTheme }) {

  const [isSignup, setIsSignup] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({

    username: "",

    email: "",

    password: "",

  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
 
  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };
 
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
 
    if (!form.password.trim()) {

      setError("Please enter your password.");

      return;

    }
 
    if (isSignup && !form.username.trim()) {

      setError("Please enter your username.");

      return;

    }
 
    if (isSignup && !form.email.trim()) {

      setError("Please enter your email.");

      return;

    }
 
    setLoading(true);
 
    try {
      if (isSignup) {
        await signup({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        setIsSignup(false);
        setForm((current) => ({
          ...current,
          username: current.username.trim(),
          password: "",
        }));
        setError("Account created if the server accepted your details. Please log in.");
      } else {
        const response = await login({
          email: form.email.trim(),
          password: form.password,
        });
        const data = response?.data ?? response;
        const token = data?.accessToken ?? data?.token ?? data?.access_token ??
          data?.jwt ?? data?.access_token_value;

        if (!token) {
          throw new Error(
            "Login response did not include a recognized token field. Confirm the backend login response format."
          );
        }

        sessionStorage.setItem("accessToken", token);
        onLoginSuccess?.(data);
      }
    } catch (err) {

      setError(

        err.response?.data?.message ||

          err.response?.data?.error ||

          err.message ||

          "Unable to sign in. Please check your details."

      );

    } finally {

      setLoading(false);

    }

  };
 
  return (
<div className="login-bg relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-10">
{onToggleTheme && <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6"><ThemeToggle theme={theme} onToggle={onToggleTheme} compact /></div>}
<div className="login-card grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:grid-cols-2">
<div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex">
<div>
<div className="flex items-center gap-3">
<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">

                M
</div>
<span className="text-2xl font-bold">MindTrace AI</span>
</div>
 
            <div className="mt-24">
<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">

                Learn smarter
</p>
<h1 className="mt-4 text-4xl font-bold leading-tight">

                Understand your mistakes.
<br />

                Master every concept.
</h1>
<p className="mt-5 leading-7 text-indigo-100">

                Your personal learning space for programming,

                practice, and AI-powered guidance.
</p>
</div>
</div>
 
          <p className="text-sm text-indigo-100">

            Your learning journey starts here.
</p>
</div>
 
        <div className="p-6 sm:p-10">
<div className="mb-8 md:hidden">
<div className="flex items-center gap-3">
<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl font-bold text-white">

                M
</div>
<span className="text-xl font-bold text-slate-900">

                MindTrace AI
</span>
</div>
</div>
 
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">

            Your learning space
</p>
 
          <h2 className="mt-3 text-3xl font-bold text-slate-900">

            {isSignup ? "Create your account" : "Welcome back"}
</h2>
 
          <p className="mt-2 text-sm leading-6 text-slate-500">

            {isSignup

              ? "Sign up to start your personalized learning journey."

              : "Sign in to continue learning with MindTrace AI."}
</p>
 
          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
<button

              type="button"

              onClick={() => {

                setIsSignup(false);

                setError("");

              }}

              className={`rounded-lg py-2.5 text-sm font-semibold transition ${

                !isSignup

                  ? "bg-white text-indigo-700 shadow-sm"

                  : "text-slate-500"

              }`}
>

              Login
</button>
 
            <button

              type="button"

              onClick={() => {

                setIsSignup(true);

                setError("");

              }}

              className={`rounded-lg py-2.5 text-sm font-semibold transition ${

                isSignup

                  ? "bg-white text-indigo-700 shadow-sm"

                  : "text-slate-500"

              }`}
>

              Sign Up
</button>
</div>
 
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            {isSignup && (
<div>
<label className="mb-2 block text-sm font-medium text-slate-700">

                  Username
</label>
<input

                  name="username"

                  value={form.username}

                  onChange={handleChange}

                  placeholder="Choose a username"

                  autoComplete="username"

                  required

                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"

                />
</div>

            )}
 
            <div>
<label className="mb-2 block text-sm font-medium text-slate-700">

                {isSignup ? "Email address" : "Email address"}
</label>
<input

                name="email"

                value={form.email}

                onChange={handleChange}

                placeholder={

                  "you@example.com"

                }

                type="email"

                autoComplete="email"

                required

                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"

              />
</div>
 
            <div>
<label className="mb-2 block text-sm font-medium text-slate-700">

                Password
</label>
 
              <div className="relative">
<input

                  name="password"

                  value={form.password}

                  onChange={handleChange}

                  type={showPassword ? "text" : "password"}

                  placeholder="Enter your password"

                  autoComplete={

                    isSignup ? "new-password" : "current-password"

                  }

                  required

                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"

                />
 
                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600"
>

                  {showPassword ? "Hide" : "Show"}
</button>
</div>
</div>
 
            {error && (
<div

                role="alert"

                className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
>

                {error}
</div>

            )}
 
            <button

              type="submit"

              disabled={loading}

              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
>

              {loading

                ? "Please wait..."

                : isSignup

                  ? "Create Account"

                  : "Login to MindTrace"}
</button>
</form>
 
          <p className="mt-6 text-center text-sm text-slate-500">

            {isSignup

              ? "Already have an account?"

              : "New to MindTrace AI?"}{" "}
<button

              type="button"

              onClick={() => {

                setIsSignup(!isSignup);

                setError("");

              }}

              className="font-semibold text-indigo-600 hover:text-indigo-800"
>

              {isSignup ? "Login" : "Create account"}
</button>
</p>
</div>
</div>
</div>

  );

}

 