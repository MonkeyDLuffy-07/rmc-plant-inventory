"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Building2,
  BarChart3,
  Bell,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  role: "admin" | "operator";
  name: string;
}

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authUser");
    }
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package },
    { href: "/dashboard/transactions", label: "Transactions", icon: ArrowRightLeft },
    { href: "/dashboard/suppliers", label: "Suppliers", icon: Building2 },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <span className="text-lg font-semibold">RMC Plant</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-muted-foreground hover:text-foreground hover:bg-accent rounded p-1"
        >
          ☰
        </button>
      </div>

      <nav className="hidden md:flex flex-col gap-1 px-3 py-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {isMobileMenuOpen && (
        <nav className="md:hidden flex flex-col gap-1 px-3 py-4 border-t border-sidebar-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      <div className="border-t border-sidebar-border p-4 flex items-center justify-between gap-2">
        <div className="text-xs">
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground capitalize">{user.role}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
