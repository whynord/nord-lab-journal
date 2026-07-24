import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function listPublishedPostsByTag(tag: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .contains("tags", [tag])
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function listAllPublishedTags(): Promise<{ tag: string; count: number }[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("tags")
    .eq("published", true);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { tags: string[] | null }[]) {
    for (const t of row.tags ?? []) {
      const k = t.trim();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function listAllPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return (data as Post) ?? null;
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Post) ?? null;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function normalizeTag(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  for (const raw of input.split(",")) {
    const t = normalizeTag(raw);
    if (t) seen.add(t);
  }
  return [...seen];
}
