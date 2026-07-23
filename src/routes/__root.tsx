import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-mono-xs text-neon mb-4">// STATUS 404</div>
        <h1 className="text-display text-8xl text-foreground">Signal lost</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          The frequency you're tuning into doesn't exist here.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 text-mono-xs text-neon border border-neon px-4 py-2 hover:bg-neon hover:text-background transition-colors"
        >
          ← Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-mono-xs text-destructive mb-4">// STATUS 500</div>
        <h1 className="text-display text-6xl">Interference detected</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 text-mono-xs border border-neon text-neon px-4 py-2 hover:bg-neon hover:text-background transition-colors"
        >
          Retry signal
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tuning that frequency — a personal blog" },
      { name: "description", content: "Notes, signals and long-form transmissions. A personal blog." },
      { property: "og:title", content: "Tuning that frequency — a personal blog" },
      { property: "og:description", content: "Notes, signals and long-form transmissions. A personal blog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tuning that frequency — a personal blog" },
      { name: "twitter:description", content: "Notes, signals and long-form transmissions. A personal blog." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/a9e18854-6e7b-44a5-a874-a67c1c467c33" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/a9e18854-6e7b-44a5-a874-a67c1c467c33" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function useSession() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return userEmail;
}

function Clock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-mono-xs text-muted-foreground">LOC {time}</span>;
}

function Header() {
  const email = useSession();
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-display text-2xl tracking-tight">NORD</span>
          <span className="text-mono-xs text-muted-foreground hidden sm:inline">
            <span className="text-neon animate-pulse">•</span> <span className="text-neon">LIVE</span> // TUNING THAT FREQUENCY
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-mono-xs text-muted-foreground hover:text-neon transition-colors">
            [ ARCHIVE ]
          </Link>
          <a
            href="https://whynord.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mono-xs text-muted-foreground hover:text-neon transition-colors"
          >
            [ WHYNORD.NET ]
          </a>
          <a
            href="https://about.whynord.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-mono-xs text-muted-foreground hover:text-neon transition-colors"
          >
            [ ABOUT ME ]
          </a>
          {email ? (
            <>
              <Link to="/admin" className="text-mono-xs text-muted-foreground hover:text-neon transition-colors">
                [ ADMIN ]
              </Link>
              <button
                onClick={signOut}
                className="text-mono-xs bg-neon text-background px-3 py-1.5 hover:bg-neon-dim transition-colors"
              >
                SIGN OUT ↗
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="text-mono-xs bg-neon text-background px-3 py-1.5 hover:bg-neon-dim transition-colors"
            >
              SIGN IN ↗
            </Link>
          )}
          <Clock />
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <div className="text-mono-xs text-muted-foreground">
          <span className="text-neon">◉</span> TUNING THAT FREQUENCY // NODE:BLOG.LOCAL
        </div>
        <div className="text-mono-xs text-muted-foreground">
          © {new Date().getFullYear()} — ALL SIGNALS RESERVED
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
