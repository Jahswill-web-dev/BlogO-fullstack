"use client";

import { useEffect, useState } from "react";
import { api, AuthUser } from "@/lib/api";

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, loggedIn: !!user };
}
