import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Articles live in web/content/blog/<slug>.md (written by blog/generate.py or by hand).
const DIR = path.join(process.cwd(), "content", "blog");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  calculator?: string;
  video?: string;
  faq?: { q: string; a: string }[];
  draft: boolean;
  html: string;
  minutes: number;
};

function read(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const words = content.split(/\s+/).length;
  return {
    slug: file.replace(/\.md$/, ""),
    title: data.title,
    description: data.description,
    // gray-matter turns an unquoted YAML date into a Date object
    date: (data.date instanceof Date ? data.date.toISOString() : String(data.date)).slice(0, 10),
    calculator: data.calculator,
    video: data.video,
    faq: data.faq,
    draft: Boolean(data.draft),
    html: marked.parse(content, { async: false }) as string,
    minutes: Math.max(1, Math.round(words / 230)),
  };
}

export function allPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(read)
    .filter((p) => !p.draft || process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

export function formatDate(d: string) {
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
