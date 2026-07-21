import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@tanstack/react-router";
import { slugify, type Post } from "@/lib/posts";

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  published: boolean;
};

export function PostEditor({
  initial,
  onSubmit,
  saving,
  error,
  submitLabel = "SAVE",
}: {
  initial?: Post | null;
  onSubmit: (v: PostFormValues) => void;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<PostFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    cover_url: initial?.cover_url ?? "",
    published: initial?.published ?? false,
  });
  const [autoSlug, setAutoSlug] = useState(!initial);

  useEffect(() => {
    if (autoSlug) setValues((v) => ({ ...v, slug: slugify(v.title) }));
  }, [values.title, autoSlug]);

  const set = <K extends keyof PostFormValues>(k: K, v: PostFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="grid lg:grid-cols-2 gap-8"
    >
      {/* LEFT: form */}
      <div className="space-y-5">
        <div>
          <label className="text-mono-xs text-neon">$ title</label>
          <input
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            className="mt-2 w-full bg-background border border-border px-3 py-2 text-2xl font-display focus:outline-none focus:border-neon"
            placeholder="What are we transmitting?"
          />
        </div>

        <div>
          <label className="text-mono-xs text-neon flex items-center justify-between">
            <span>$ slug</span>
            <label className="text-muted-foreground flex items-center gap-2 normal-case">
              <input type="checkbox" checked={autoSlug} onChange={(e) => setAutoSlug(e.target.checked)} />
              auto
            </label>
          </label>
          <input
            required
            value={values.slug}
            onChange={(e) => { setAutoSlug(false); set("slug", slugify(e.target.value)); }}
            className="mt-2 w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon"
            placeholder="my-first-signal"
          />
        </div>

        <div>
          <label className="text-mono-xs text-neon">$ excerpt</label>
          <textarea
            value={values.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className="mt-2 w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon"
            placeholder="Short teaser shown in the archive"
          />
        </div>

        <div>
          <label className="text-mono-xs text-neon">$ cover_url</label>
          <input
            value={values.cover_url}
            onChange={(e) => set("cover_url", e.target.value)}
            className="mt-2 w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-neon"
            placeholder="https://…"
          />
          {values.cover_url && (
            <img src={values.cover_url} alt="" className="mt-3 w-full border border-border max-h-64 object-cover" />
          )}
        </div>

        <div>
          <label className="text-mono-xs text-neon">$ content.md</label>
          <textarea
            required
            value={values.content}
            onChange={(e) => set("content", e.target.value)}
            rows={22}
            className="mt-2 w-full bg-background border border-border px-3 py-3 text-sm font-mono focus:outline-none focus:border-neon leading-relaxed"
            placeholder="# Write in markdown…"
          />
        </div>

        <div className="flex items-center justify-between border border-border p-3">
          <label className="flex items-center gap-3 text-mono-xs">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            <span className={values.published ? "text-neon" : "text-muted-foreground"}>
              {values.published ? "◉ PUBLISHED (public)" : "◌ DRAFT (hidden)"}
            </span>
          </label>
        </div>

        {error && (
          <div className="text-mono-xs text-destructive border border-destructive/50 p-2">
            // ERROR: {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="text-mono-xs bg-neon text-background px-5 py-2.5 hover:bg-neon-dim transition-colors disabled:opacity-50"
          >
            {saving ? "TRANSMITTING…" : submitLabel}
          </button>
          <Link to="/admin" className="text-mono-xs text-muted-foreground hover:text-neon">
            ← back to admin
          </Link>
        </div>
      </div>

      {/* RIGHT: preview */}
      <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] overflow-y-auto border border-border p-6 bg-card/30">
        <div className="text-mono-xs text-muted-foreground mb-4">// LIVE PREVIEW</div>
        <h1 className="text-display text-4xl leading-[0.9]">{values.title || "Untitled"}</h1>
        {values.excerpt && (
          <p className="mt-3 text-sm text-muted-foreground border-l-2 border-neon pl-3">
            {values.excerpt}
          </p>
        )}
        {values.cover_url && (
          <img src={values.cover_url} alt="" className="mt-4 w-full border border-border" />
        )}
        <div className="mt-6 prose-blog">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {values.content || "*Nothing yet.*"}
          </ReactMarkdown>
        </div>
      </div>
    </form>
  );
}
