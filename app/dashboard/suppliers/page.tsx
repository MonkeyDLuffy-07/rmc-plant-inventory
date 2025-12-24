"use client";

import { useEffect, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import { SupplierList } from "@/components/supplier-list";

export default function SuppliersPage() {
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
          Suppliers
        </h1>
        <p className="text-slate-400">
          Manage your material suppliers and vendors
        </p>
      </div>
      <SupplierList userRole={userRole} />
    </div>
  );
}
