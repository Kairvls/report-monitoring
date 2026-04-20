"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const validate = () => {
    if (!username.trim()) return "Username is required";
    if (username.trim().length < 2) return "Username must be at least 2 characters";

    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";

    return "";
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.message || "Invalid username or password");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !username.trim() || !password || password.length < 6 || loading;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_35%,_#020617_100%)] px-4 py-6 sm:px-6 sm:py-8">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-white/5 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl sm:h-72 sm:w-72" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="w-full rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-7 md:p-8">
          {/* header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-3 flex justify-center sm:mb-4">
              <img
                className="h-24 w-auto object-contain sm:h-28 md:h-32"
                src="/image/logo.png"
                alt="logo"
              />
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Welcome back
            </h1>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/65">
              Sign in to access your dashboard
            </p>
          </div>

          {/* error */}
          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* username */}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-white/75">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-blue-500/70 sm:h-13"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/75">
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/10 px-4 pr-12 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-blue-500/70 sm:h-13"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/60 transition hover:bg-black/10 hover:text-white active:scale-95"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition active:scale-[0.99] sm:h-13 sm:text-base
                ${
                  isDisabled
                    ? "cursor-not-allowed bg-white/10 opacity-50"
                    : "bg-white text-slate-950 shadow-lg shadow-black/20 hover:bg-slate-100"
                }`}
            >
              {!loading && <ShieldCheck size={18} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center sm:mt-7 sm:pt-5">
            <p className="text-xs tracking-wide text-white/40">
              Secure Admin Login System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
