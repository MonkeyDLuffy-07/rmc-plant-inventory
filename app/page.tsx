"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const defaultUser = {
      id: "1",
      username: "admin" as const,
      role: "admin" as const,
      name: "Administrator",
    };

    try {
      const stored = localStorage.getItem("authUser");
      if (!stored) {
        localStorage.setItem("authUser", JSON.stringify(defaultUser));
      }
    } catch {
      // ignore
    }

    router.push("/dashboard");
  }, [router]);

  return null;
}
