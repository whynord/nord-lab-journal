import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostEditor, type PostFormValues } from "@/components/PostEditor";

export const Route = createFileRoute("/_authenticated/admin/new")({
  component: NewPost,
});

function NewPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (v: PostFormValues) => {
    setError(null);
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const payload = {
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt || null,
        content: v.content,
        cover_url: v.cover_url || null,
        published: v.published,
        published_at: v.published ? new Date().toISOString() : null,
        author_id: userData.user?.id ?? null,
      };
      const { data, error } = await supabase.from("posts").insert(payload).select().single();
      if (error) throw error;
      router.navigate({ to: "/admin/$id", params: { id: data.id } });
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-mono-xs text-neon">◉ NEW TRANSMISSION</div>
        <h1 className="text-display text-5xl mt-2">Compose an entry</h1>
      </div>
      <PostEditor onSubmit={submit} saving={saving} error={error} submitLabel="PUBLISH / SAVE" />
    </div>
  );
}
