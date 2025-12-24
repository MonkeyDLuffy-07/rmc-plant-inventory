"use client";

import { AlertsList } from "@/components/alerts-list";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-chart-5">
          Stock Alerts
        </h1>
        <p className="text-slate-400">
          Monitor and manage low stock notifications
        </p>
      </div>
      <AlertsList />
    </div>
  );
}
