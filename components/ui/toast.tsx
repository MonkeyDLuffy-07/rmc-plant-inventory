"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "destructive";

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: ToastVariant;
}


const ToastContext = React.createContext<{
  close: () => void;
} | null>(null);

function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("ToastClose must be used within a Toast");
  }
  return ctx;
}

function Toast({
  className,
  variant = "default",
  title,
  description,
  action,
  children,
  ...props
}: ToastProps) {
  const [open, setOpen] = React.useState(true);

  if (!open) return null;

  return (
    <ToastContext.Provider value={{ close: () => setOpen(false) }}>
      <div
        className={cn(
          "pointer-events-auto relative flex w-full min-w-[260px] max-w-[360px] items-start gap-3 rounded-md border p-3 text-sm shadow-lg",
          "bg-background text-foreground",
          variant === "destructive" &&
            "border-destructive/50 bg-destructive text-destructive-foreground",
          className,
        )}
        {...props}
      >
        <div className="flex-1 space-y-1">
          {title && <div className="font-medium leading-none">{title}</div>}
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
          {children}
        </div>
        {action}
        <ToastClose />
      </div>
    </ToastContext.Provider>
  );
}

function ToastClose({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { close } = useToastContext();
  return (
    <button
      type="button"
      onClick={close}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground",
        "hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      <XIcon className="h-3 w-3" />
      <span className="sr-only">Close</span>
    </button>
  );
}

function ToastTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("font-medium leading-none", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Toast, ToastClose, ToastTitle, ToastDescription };
