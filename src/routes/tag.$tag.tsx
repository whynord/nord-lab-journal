import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPostsByTag } from "@/lib/posts";

export const Route = createFileRoute("/tag/$tag")({
  component: TagPage,
  head: ({ params }) => ({
    meta: [
      { title: `#${params.tag} — Tuning that frequency` },
      { name: "description", content: `Transmissions tagged #${params.tag}.` },
      { property: "og:title", content: `#${params.tag} — Tuning that frequency` },
      { property: "og:description", content: `Transmissions tagged #${params.tag}.` },
    ],
  }),
});

function formatDate(iso: string | null) {
  if (!iso) return "DRAFT";
  return new Date(iso).toISOString().slice(0, 10).replace(/-/g, ".");
}

function TagPage() {
  const { tag } = Route.useParams();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "tag", tag],
    queryFn: () => listPublishedPostsByTag(tag),
  });

  return (
    <div className="grid-bg">
      <section className="max-w-[1400px] mx-auto px-6 pt-16 pb-10 border-b border-border">
        <Link to="/" className="text-mono-xs text-muted-foreground hover:text-neon">
          ← ARCHIVE
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-mono-xs text-neon">◉ TAG</span>
          <span className="text-mono-xs text-muted-foreground">
            // {posts?.length ?? 0} ENTRIES
          </span>
        </div>
        <h1 className="mt-4 text-display text-[clamp(3rem,10vw,8rem)] leading-[0.85]">
          #{tag}
        </h1>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 py-16">
        {isLoading && (
          <div className="text-mono-xs text-muted-foreground">◉ decoding signal…</div>
        )}

        {!isLoading && posts && posts.length === 0 && (
          <div className="border border-dashed border-border p-12 text-center">
            <div className="text-mono-xs text-muted-foreground mb-2">// EMPTY BAND</div>
            <p className="text-display text-3xl">Nothing on this frequency.</p>
            <Link
              to="/"
              className="mt-4 inline-block text-mono-xs text-neon border border-neon px-4 py-2 hover:bg-neon hover:text-background transition-colors"
            >
              ← Back to archive
            </Link>
          </div>
        )}

        <ul className="divide-y divide-border">
          {posts?.map((p, i) => (
            <li key={p.id} className="group py-6 hover:bg-card/40 transition-colors -mx-3 px-3">
              <Link
                to="/post/$slug"
                params={{ slug: p.slug }}
                className="grid grid-cols-12 gap-4 items-start"
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
