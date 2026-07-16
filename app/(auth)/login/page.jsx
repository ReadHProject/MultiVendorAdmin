"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { api } from "@/lib/api";
import { setCredentials } from "@/store/slices/authSlice";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.post("/auth/login", { email, password });
      if (data.accessToken) {
        localStorage.setItem("erp_access_token", data.accessToken);
      }
      if (data.user) {
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      }
      
      const from = searchParams.get("from");
      if (from) {
        if (from.startsWith("http")) {
          const url = new URL(from);
          url.searchParams.set("token", data.accessToken);
          window.location.href = url.toString();
        } else {
          router.push(from);
        }
      } else {
        const isAdmin = data.user?.roles?.some(r => ["ADMIN", "SUPERADMIN", "SUPER_ADMIN", "SUB_ADMIN", "STAFF"].includes(r?.toUpperCase()));
        if (isAdmin) {
          router.push("/admin");
        } else {
          window.location.href = `http://localhost:3000/account/dashboard?token=${data.accessToken}`;
        }
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Nexus ERP</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border shadow-sm">
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" required />
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
