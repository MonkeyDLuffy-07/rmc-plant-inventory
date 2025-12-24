"use client";

import { ReportsDashboard } from "@/components/reports-dashboard";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-chart-5">
          Reports
        </h1>
        <p className="text-slate-400">
          Analyze inventory performance and trends
        </p>
      </div>
      <ReportsDashboard />
    </div>
  );
}
