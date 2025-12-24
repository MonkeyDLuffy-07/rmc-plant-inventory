"use client";

import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function DashboardPage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-chart-5">
          Dashboard
        </h1>
        <p className="text-slate-400">Welcome back, {userName}</p>
      </div>
      <DashboardOverview />
    </div>
  );
}
