import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AcademicSession } from "@/hooks/useAcademicSession";

interface SessionSelectorProps {
  sessions: AcademicSession[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export default function SessionSelector({ sessions, value, onChange, className }: SessionSelectorProps) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className={className} aria-label="Academic Session">
        <SelectValue placeholder="Select session" />
      </SelectTrigger>
      <SelectContent>
        {sessions.map((s) => (
          <SelectItem key={s.id} value={s.session_name}>
            {s.session_name} {s.is_active ? "(Active)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
