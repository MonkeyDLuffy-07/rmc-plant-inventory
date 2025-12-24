"use client";

export interface User {
  id: string;
  username: string;
  role: "admin" | "operator";
  name: string;
}

const AUTH_KEY = "auth_user";

export function getAuthUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem(AUTH_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function requireAuth(): User {
  const user = getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireAdmin(): User {
  const user = requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
