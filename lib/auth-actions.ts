"use client";

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    username: string;
    role: "admin" | "operator";
    name: string;
  };
}

const AUTH_KEY = "auth_user";

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  const defaultCredentials = [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "admin" as const,
      name: "Admin User",
    },
    {
      id: "2",
      username: "operator",
      password: "operator123",
      role: "operator" as const,
      name: "Operator User",
    },
  ];

  const user = defaultCredentials.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return { success: false, error: "Invalid username or password" };
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(sessionUser));
  }

  return {
    success: true,
    user: sessionUser,
  };
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getAuthUser():
  | { id: string; username: string; role: "admin" | "operator"; name: string }
  | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem(AUTH_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
