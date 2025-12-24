"use client";

import * as React from "react";

import { ToastProvider } from "@/components/ui/use-toast";

export function Toaster({ children }: { children: React.ReactNode }) {
  // Wrap app in ToastProvider so toasts can render above everything
  return <ToastProvider>{children}</ToastProvider>;
}
