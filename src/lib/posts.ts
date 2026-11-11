import { getCollection, type CollectionEntry } from "astro:content";
import { isPublished, shanghaiDate } from "./publication.mjs";

export type PostSummary = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  cover: string;
  featured: boolean;
  minutes: number;
  content?: string;
};
export const categories = ["前端开发", "开发笔记", "生活随笔"];

export async function getPosts() {
  return (await getCollection("posts", ({ data }) => isPublished(data)))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
export function summarize(post: CollectionEntry<"posts">): PostSummary {
  return {
    id: post.id, ...post.data,
    date: shanghaiDate(post.data.date),
    minutes: Math.max(1, Math.ceil((post.body?.length || 0) / 400)),
  };
}
export function getTags(posts: PostSummary[]) {
  return [...new Set(posts.flatMap(post => post.tags))];
}
