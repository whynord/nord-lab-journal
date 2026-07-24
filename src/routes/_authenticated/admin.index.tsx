import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAllPosts } from "@/lib/posts";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminList,
});

function AdminList() {
  const qc = useQueryClient();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "all"],
    queryFn: listAllPosts,
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const patch: any = { published };
      if (published) patch.published_at = new Date().toISOString();
      const { error } = await supabase.from("posts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="flex items-baseline justify-between border-b border-border pb-4 mb-8">
        <div>
          <div className="text-mono-xs text-neon">◉ CONTROL ROOM</div>
          <h1 className="text-display text-6xl mt-2">Manage transmissions</h1>
        </div>
        <Link
          to="/admin/new"
          className="text-mono-xs bg-neon text-background px-4 py-2 hover:bg-neon-dim transition-colors"
        >
          + NEW ENTRY
        </Link>
      </div>

      {isLoading && <div className="text-mono-xs text-muted-foreground">decoding…</div>}

      {!isLoading && posts && posts.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-display text-3xl">No entries yet.</p>
          <Link
            to="/admin/new"
            className="mt-4 inline-block text-mono-xs text-neon border border-neon px-4 py-2 hover:bg-neon hover:text-background transition-colors"
          >
            Write the first one →
          </Link>
        </div>
      )}

      <ul className="divide-y divide-border">
        {posts?.map((p) => (
          <li key={p.id} className="py-4 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-3">
                <span className={`text-mono-xs ${p.published ? "text-neon" : "text-muted-foreground"}`}>
                  {p.published ? "◉ LIVE" : "◌ DRAFT"}
                </span>
                <span className="text-mono-xs text-muted-foreground">/{p.slug}</span>
              </div>
              <div className="text-display text-2xl mt-1">{p.title || "(untitled)"}</div>
            </div>
            <div className="col-span-12 md:col-span-5 flex flex-wrap gap-2 md:justify-end">
              <button
                onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
                className="text-mono-xs border border-border px-3 py-1.5 hover:border-neon hover:text-neon transition-colors"
              >
                {p.published ? "UNPUBLISH" : "PUBLISH"}
              </button>
              <Link
                to="/admin/preview/$id"
                params={{ id: p.id }}
                className="text-mono-xs border border-border px-3 py-1.5 hover:border-neon hover:text-neon transition-colors"
              >
                PREVIEW
              </Link>
              {p.published && (
                <Link
                  to="/post/$slug"
                  params={{ slug: p.slug }}
                  className="text-mono-xs border border-border px-3 py-1.5 hover:border-neon hover:text-neon transition-colors"
                >
                  VIEW ↗
                </Link>
              )}

              <Link
                to="/admin/$id"
                params={{ id: p.id }}
                className="text-mono-xs bg-secondary px-3 py-1.5 hover:bg-neon hover:text-background transition-colors"
              >
                EDIT
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete "${p.title}"? This cannot be undone.`)) del.mutate(p.id);
                }}
                className="text-mono-xs border border-destructive/50 text-destructive px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                DELETE
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
