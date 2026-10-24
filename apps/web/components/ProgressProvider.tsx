"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import type { ProgressData } from "@/lib/types";

interface ProgressContextValue {
  progress: ProgressData | null;
  loading: boolean;
  failed: boolean;
  refresh: () => Promise<void>;
  clear: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const emptyProgress: ProgressData = {
  totalAttempts: 0,
  attempts: [],
  completedLessons: [],
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<ProgressData>("/api/progress", { timeoutMs: 8_000 });
      setProgress(data);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    await apiRequest<void>("/api/progress", { method: "DELETE" });
    setProgress(emptyProgress);
    setFailed(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ progress, loading, failed, refresh, clear }),
    [progress, loading, failed, refresh, clear],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider.");
  return value;
}
