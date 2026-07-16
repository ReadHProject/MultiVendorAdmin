"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setCredentials, logout } from "../store/slices/authSlice";
import { api } from "../lib/api";

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const data = await api.get("/auth/me");
        const token = localStorage.getItem("erp_access_token");
        dispatch(setCredentials({ user: data, accessToken: token || "" }));
        setHydrated(true);
      } catch {
        localStorage.removeItem("erp_access_token");
        dispatch(logout());
        router.replace("/login");
      }
    }
    hydrate();
  }, [dispatch, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return children;
}

export { AuthProvider };
