import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPostById } from "@/lib/posts";
import { PostEditor, type PostFormValues } from "@/components/PostEditor";

export const Route = createFileRoute("/_authenticated/admin/$id")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-id", id],
    queryFn: () => getPostById(id),
  });

  const submit = async (v: PostFormValues) => {
    setError(null);
    setSaving(true);
    try {
      const patch: any = {
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt || null,
        content: v.content,
        cover_url: v.cover_url || null,
        tags: v.tags,
        published: v.published,
      };

      // Set published_at first time it goes live
      if (v.published && !post?.published_at) {
        patch.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from("posts").update(patch).eq("id", id);
      if (error) throw error;
      router.navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-[1400px] mx-auto px-6 py-16 text-mono-xs text-muted-foreground">decoding…</div>;
  }
  if (!post) {
    return <div className="max-w-[1400px] mx-auto px-6 py-16 text-mono-xs">// entry not found</div>;
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12">
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <div className="text-mono-xs text-neon">◉ EDIT</div>
          <h1 className="text-display text-5xl mt-2">{post.title}</h1>
        </div>
        <div className="text-mono-xs text-muted-foreground">
          UPDATED {new Date(post.updated_at).toISOString().slice(0, 16).replace("T", " ")}
        </div>
      </div>
      <PostEditor initial={post} onSubmit={submit} saving={saving} error={error} submitLabel="SAVE CHANGES" />
    </div>
  );
}
