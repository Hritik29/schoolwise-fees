import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AcademicSession {
  id: string;
  session_name: string;
  is_active: boolean;
  created_at: string;
}

const STORAGE_KEY = "academic_session";

export function useAcademicSession() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("academic_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
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
