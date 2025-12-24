"use client";

import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import { InventoryList } from "@/components/inventory-list";

export default function InventoryPage() {
  const [userRole, setUserRole] = useState<"admin" | "operator">("operator");

  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-chart-5">
          Inventory
        </h1>
        <p className="text-slate-400">
          Manage your RMC plant raw materials
        </p>
      </div>
      <InventoryList userRole={userRole} />
    </div>
  );
}
