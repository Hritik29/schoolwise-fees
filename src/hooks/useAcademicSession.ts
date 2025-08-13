import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AcademicSession {
  id: string;
  session_name: string;
  is_active: boolean;
  created_at: string;
}

const STORAGE_KEY = "academic_session";
const DEFAULT_SESSION_NAME = "2025-26";
let hasAttemptedSeed = false;

export function useAcademicSession() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const selectQuery = () =>
        supabase
          .from("academic_sessions")
          .select("*")
          .order("created_at", { ascending: false });

      let { data, error } = await selectQuery();
      if (error) throw error;

      if (!data || data.length === 0) {
        if (!hasAttemptedSeed) {
          hasAttemptedSeed = true;
          await supabase
            .from("academic_sessions")
            .insert({ session_name: DEFAULT_SESSION_NAME, is_active: true });
          const res2 = await selectQuery();
          data = res2.data || [];
        }
      }

      setSessions(data || []);

      // Determine default session
      const active = data?.find((s) => s.is_active) || data?.[0] || null;
      const stored = localStorage.getItem(STORAGE_KEY);
      const initial = stored || active?.session_name || null;
      setSelectedSession(initial);
      if (initial) localStorage.setItem(STORAGE_KEY, initial);
    } catch (e) {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const changeSession = (value: string) => {
    setSelectedSession(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const activeSession = sessions.find((s) => s.is_active) || null;

  return { sessions, selectedSession, setSelectedSession: changeSession, activeSession, loading, refresh: fetchSessions };
}
