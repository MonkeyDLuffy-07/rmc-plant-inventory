"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

interface User {
  id: string;
  username: string;
  role: "admin" | "operator";
  name: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("authUser");
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
