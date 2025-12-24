"use client";

import { useEffect, useState } from "react";
import { getAuthUser, type User } from "@/lib/auth";
import { TransactionList } from "@/components/transaction-list";

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setUser(authUser);
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-chart-5">
          Stock Transactions
        </h1>
        <p className="text-slate-400">
          Record and track material movements
        </p>
      </div>
      <TransactionList user={user} />
    </div>
  );
}
