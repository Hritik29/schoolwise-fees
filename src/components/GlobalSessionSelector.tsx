import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/contexts/SessionContext";

export default function GlobalSessionSelector({ className }: { className?: string }) {
  const { currentSessionId, setCurrentSessionId, sessions, loading } = useSession();

  if (loading) {
    return <div className="w-48 h-9 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <Select value={currentSessionId || undefined} onValueChange={setCurrentSessionId}>
      <SelectTrigger className={className || "w-48"} aria-label="Academic Session">
        <SelectValue placeholder="Select session" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id}>
            {session.session_name} {session.is_active ? "(Active)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}