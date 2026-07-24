import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPosts, listAllPublishedTags } from "@/lib/posts";


export const Route = createFileRoute("/")({
  component: Home,
});

function formatDate(iso: string | null) {
  if (!iso) return "DRAFT";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10).replace(/-/g, ".");
}

function Home() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "published"],
    queryFn: listPublishedPosts,
  });
  const { data: tags } = useQuery({
    queryKey: ["tags", "published"],
    queryFn: listAllPublishedTags,
  });


  return (
    <div className="grid-bg">
      {/* HERO */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-24">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-mono-xs text-neon">◉ BROADCASTING</span>
            <span className="text-mono-xs text-muted-foreground">// PERSONAL LOG // v01</span>
          </div>

          <h1 className="text-display text-[clamp(3.5rem,13vw,12rem)] leading-[0.82]">
            TUNING
            <br />
            THAT{" "}
            <span className="outline-text">FREQUENCY.</span>
          </h1>

          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="border border-border p-4 bg-card/40">
              <div className="text-mono-xs text-neon mb-2">$ blog --identify</div>
              <div className="text-mono-xs text-muted-foreground leading-relaxed">
                → Personal notes, signals, transmissions.
                <br />
                → Long-form writing on whatever's on the dial.
              </div>
            </div>
            <div className="border border-border p-4 bg-card/40">
              <div className="text-mono-xs text-neon mb-2">$ blog --status</div>
              <div className="text-mono-xs text-muted-foreground leading-relaxed">
                → {posts?.length ?? "—"} transmissions logged
                <br />
                → Antenna up. Next dispatch soon.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHIVE */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between border-b border-border pb-4 mb-10">
          <h2 className="text-display text-4xl md:text-5xl">
            <span className="text-neon">//</span> ARCHIVE
          </h2>
          <span className="text-mono-xs text-muted-foreground">
            {posts?.length ?? 0} ENTRIES
          </span>
        </div>

        {isLoading && (
          <div className="text-mono-xs text-muted-foreground">◉ decoding signal…</div>
        )}

        {!isLoading && posts && posts.length === 0 && (
          <div className="border border-dashed border-border p-12 text-center">
            <div className="text-mono-xs text-muted-foreground mb-2">// EMPTY BAND</div>
            <p className="text-display text-3xl">No transmissions yet.</p>
            <p className="text-mono-xs text-muted-foreground mt-3">
              Sign in and publish the first entry.
            </p>
          </div>
        )}

        <ul className="divide-y divide-border">
          {posts?.map((p, i) => (
            <li key={p.id}>
              <Link
                to="/post/$slug"
                params={{ slug: p.slug }}
                className="group grid grid-cols-12 gap-4 py-6 items-start hover:bg-card/40 transition-colors -mx-3 px-3"
              >
                <div className="col-span-12 md:col-span-2 flex items-center gap-3">
                  <span className="text-mono-xs text-neon">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <span className="text-mono-xs text-muted-foreground">
                    {formatDate(p.published_at)}
                  </span>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="text-display text-3xl md:text-5xl leading-[0.9] group-hover:text-neon transition-colors">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                      {p.excerpt}
                    </p>
                  )}
                </div>
                <div className="col-span-12 md:col-span-2 flex md:justify-end items-center">
                  <span className="text-mono-xs text-muted-foreground group-hover:text-neon transition-colors">
                    READ ↗
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
