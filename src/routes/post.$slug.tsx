import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPostBySlug } from "@/lib/posts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/post/$slug")({
  component: PostPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Tuning that frequency` },
    ],
  }),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-24 text-mono-xs text-muted-foreground">
        ◉ decoding signal…
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-24">
        <div className="text-mono-xs text-neon mb-4">// STATUS 404</div>
        <h1 className="text-display text-6xl">Signal lost.</h1>
        <Link to="/" className="mt-6 inline-block text-mono-xs text-neon border border-neon px-4 py-2 hover:bg-neon hover:text-background transition-colors">
          ← Back to archive
        </Link>
      </div>
    );
  }

  const date = post.published_at
    ? new Date(post.published_at).toISOString().slice(0, 10).replace(/-/g, ".")
    : "";

  const hasThai = /[\u0E00-\u0E7F]/.test(
    `${post.title} ${post.excerpt ?? ""} ${post.content}`
  );

  return (
    <article className="grid-bg">
      <div className="max-w-[900px] mx-auto px-6 pt-16 pb-24">
        <Link to="/" className="text-mono-xs text-muted-foreground hover:text-neon">
          ← ARCHIVE
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <span className="text-mono-xs text-neon">◉ ENTRY</span>
          <span className="text-mono-xs text-muted-foreground">// {date}</span>
        </div>

        <h1 className="mt-4 text-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.88]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-6 text-lg text-muted-foreground border-l-2 border-neon pl-4">
            {post.excerpt}
          </p>
        )}

        {post.cover_url && (
          <img
            src={post.cover_url}
            alt=""
            className="mt-10 w-full border border-border"
          />
        )}

        <div className={cn("mt-10 prose-blog", hasThai && "thai")}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-16 pt-6 border-t border-border text-mono-xs text-muted-foreground">
          END OF TRANSMISSION — <Link to="/" className="text-neon hover:underline">back to archive</Link>
        </div>
      </div>
    </article>
  );
}
