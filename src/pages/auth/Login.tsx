import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
export default function Login() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
const [loading, setLoading] = useState(false);
const { toast } = useToast();
const navigate = useNavigate();
const { login } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded allowed users
    const allowedUsers: Record<string, string> = {
      "rakesh@supervision.in": "maheshwari1.1048",
      "arvind@supervision.in": "arvind.20",
      "ram@supervision.in": "fees.2025",
      "sunil@supervision.in": "svia.2025",
      "admin": "admin",
    };

    try {
      const email = credentials.email.trim();
      const password = credentials.password;

      if (!allowedUsers[email] || allowedUsers[email] !== password) {
        throw new Error("Invalid credentials");
      }

const user = { id: email, email };
login(user);

// Log the login activity (best-effort)
      try {
        await supabase.from("activity_logs").insert({
          user_email: email,
          action: "LOGIN",
          description: "User logged in successfully",
          module: "Authentication",
          ip_address: "Unknown",
          user_agent: navigator.userAgent,
        });
      } catch {}

toast({ title: "Success!", description: "Login successful" });

navigate("/", { replace: true });
} catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Super-Vision Login</CardTitle>
          <CardDescription>Enter your credentials to access the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email/Username</Label>
              <Input
                id="email"
                type="text"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email or username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}