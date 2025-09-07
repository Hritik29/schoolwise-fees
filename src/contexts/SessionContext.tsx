import { createContext, useContext, ReactNode } from "react";
import { useAcademicSession } from "@/hooks/useAcademicSession";

interface SessionContextType {
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string) => void;
  sessions: Array<{id: string; session_name: string; is_active: boolean; created_at: string}>;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { sessions, selectedSession, setSelectedSession, loading, refresh } = useAcademicSession();
  
  const currentSessionId = sessions.find(s => s.session_name === selectedSession)?.id || null;
  
  const setCurrentSessionId = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session.session_name);
    }
  };

  return (
    <SessionContext.Provider value={{
      currentSessionId,
      setCurrentSessionId,
      sessions,
      loading,
      refresh
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}