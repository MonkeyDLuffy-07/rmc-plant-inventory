"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  role: "admin" | "operator";
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let msg = "Login failed";
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const user = (await res.json()) as User;
      localStorage.setItem("authUser", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md space-y-6 p-8 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-chart-5">
            Sign in
          </h1>
          <p className="text-slate-400">
            Sign in to manage your plant operations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-chart-5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-chart-5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-chart-5 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-chart-5/90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-slate-500">
          Default credentials: <span className="font-semibold">admin / admin123</span>
        </p>
      </div>
    </div>
  );
}
