import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/admin" });
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        router.navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="text-mono-xs text-muted-foreground hover:text-neon">
          ← ARCHIVE
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-mono-xs text-neon">◉ TERMINAL</span>
          <span className="text-mono-xs text-muted-foreground">// {mode === "signin" ? "AUTH.LOGIN" : "AUTH.REGISTER"}</span>
        </div>
        <h1 className="mt-3 text-display text-6xl leading-none">
          {mode === "signin" ? (<>Access <span className="text-neon">.channel</span></>) : (<>New <span className="text-neon">operator</span></>)}
        </h1>
        <p className="mt-3 text-mono-xs text-muted-foreground">
          {mode === "signin"
            ? "Enter credentials to publish, edit, and manage transmissions."
            : "Create the admin account for this blog. Only do this once."}
        </p>

        <form onSubmit={submit} className="mt-8 border border-border bg-card/50 p-6 space-y-5">
          <div>
            <label className="text-mono-xs text-neon">$ email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon"
              placeholder="operator@node.local"
            />
          </div>
          <div>
            <label className="text-mono-xs text-neon">$ password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-mono-xs text-destructive border border-destructive/50 p-2">
              // ERROR: {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neon text-background text-mono-xs py-2.5 hover:bg-neon-dim transition-colors disabled:opacity-50"
          >
            {loading ? "TRANSMITTING…" : mode === "signin" ? "SIGN IN ↗" : "REGISTER ↗"}
          </button>
          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="w-full text-mono-xs text-muted-foreground hover:text-neon transition-colors"
          >
            {mode === "signin" ? "// need an account? Register" : "// already have one? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
